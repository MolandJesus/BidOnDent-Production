/**
 * Storage Route Handlers
 * Photo uploads, storage statistics, and cleanup operations
 */

/**
 * Upload photo to storage bucket
 */
export async function handleUploadPhoto(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string

    if (!file || !bucket) {
      return respond({ error: 'Missing file or bucket parameter' }, 400)
    }

    const validBuckets = ['bidondent-profiles', 'bidondent-vehicles', 'bidondent-damage-photos']
    if (!validBuckets.includes(bucket)) {
      return respond({ error: 'Invalid bucket name' }, 400)
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return respond({ error: error.message }, 500)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return respond({ publicUrl })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
  }
}

/**
 * Get storage statistics
 */
export async function handleStorageStats(
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const buckets = ['bidondent-profiles', 'bidondent-vehicles', 'bidondent-damage-photos']
    const stats: any = {}

    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.from(bucket).list()

        if (!error && data) {
          const totalSize = data.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0)
          stats[bucket] = {
            fileCount: data.length,
            totalSize,
            formattedSize: formatBytes(totalSize)
          }
        }
      } catch (err) {
        stats[bucket] = { error: 'Unable to access bucket' }
      }
    }

    return respond({ stats })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
  }
}

/**
 * Clean up old repair reports (admin utility)
 */
export async function handleCleanupOldReports(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const body = await req.json()
    const { daysOld = 30 } = body

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data: oldReports, error: fetchError } = await supabase
      .from('damage_reports')
      .select('id, photos')
      .lt('created_at', cutoffDate.toISOString())

    if (fetchError) {
      return respond({ error: fetchError.message }, 500)
    }

    let deletedCount = 0
    const errors = []

    for (const report of oldReports || []) {
      try {
        // Delete photos from storage if they exist
        if (report.photos && Array.isArray(report.photos)) {
          for (const photoUrl of report.photos) {
            // Extract file path from URL and delete
            try {
              const filePath = photoUrl.split('/').pop()
              if (filePath) {
                await supabase.storage
                  .from('bidondent-damage-photos')
                  .remove([filePath])
              }
            } catch (photoErr) {
              // Continue even if photo deletion fails
            }
          }
        }

        // Delete the report
        const { error: deleteError } = await supabase
          .from('damage_reports')
          .delete()
          .eq('id', report.id)

        if (!deleteError) {
          deletedCount++
        }
      } catch (err: any) {
        errors.push({ reportId: report.id, error: err.message })
      }
    }

    return respond({
      success: true,
      deletedReports: deletedCount,
      daysOld,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
  }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
