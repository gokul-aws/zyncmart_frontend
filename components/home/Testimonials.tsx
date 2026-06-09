import StarRating from '@/components/ui/StarRating';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The gold-plated jhumkas I ordered are absolutely stunning. The quality is far better than I expected for the price. Will definitely shop here again!',
    product: 'Gold Plated Jhumka',
  },
  {
    id: 2,
    name: 'Ankit Mehta',
    location: 'Bangalore',
    rating: 5,
    text: 'Bought a set of educational toys for my son\'s birthday. He loves them! The packaging was eco-friendly and delivery was super fast.',
    product: 'Learning Puzzle Set',
  },
  {
    id: 3,
    name: 'Deepa Nair',
    location: 'Chennai',
    rating: 4,
    text: 'The home décor pieces are beautiful and arrived well-packed. The customer support team was very helpful when I had a question. Highly recommend.',
    product: 'Ceramic Vase Set',
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-500 text-sm">Trusted by thousands of happy shoppers across India</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
            >
              <StarRating rating={t.rating} size="md" />

              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location} · Verified buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
