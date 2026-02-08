export default function TrustStatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold mb-2">10K+</div>
            <div className="text-blue-200 text-lg">Happy Customers</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">500+</div>
            <div className="text-blue-200 text-lg">Partner Shops</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">50K+</div>
            <div className="text-blue-200 text-lg">Repairs Completed</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">4.9★</div>
            <div className="text-blue-200 text-lg">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
