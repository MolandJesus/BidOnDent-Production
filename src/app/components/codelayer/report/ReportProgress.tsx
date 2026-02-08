type ReportProgressProps = {
  progress: number;
  primaryColor: string;
};

export default function ReportProgress({ progress, primaryColor }: ReportProgressProps) {
  return (
    <div className="h-1 w-full bg-gray-200">
      <div
        className="h-1 transition-all duration-300"
        style={{ width: `${progress}%`, backgroundColor: primaryColor }}
      ></div>
    </div>
  );
}
