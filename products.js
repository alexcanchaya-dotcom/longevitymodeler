// Product Database for Longevity Modeler
// Amazon Associates Store ID: longevitymode-20

const affiliateProducts = {
  cardio: {
    id: "cardio_001",
    name: "Fit Simplify Resistance Loop Exercise Bands",
    description: "Perfect for home cardio and strength training",
    price: "$8.48",
    rating: "4.5",
    reviewCount: "132,865",
    amazonLink: "https://amzn.to/3LW2jF4",
    imageUrl: "https://images-na.ssl-images-amazon.com/images/I/81sF0Q3FGXL._AC_SL1500_.jpg",
    badge: "Best Seller",
    whyRecommend: "Affordable, portable, and perfect for building the cardiovascular habits that could add years to your life expectancy.",
    triggers: ["cardio", "exercise", "fitness", "strength", "activity"]
  },
  
  sleep: {
    id: "sleep_001",
    name: "SOLARAY Magnesium Glycinate (120 capsules)",
    description: "Supports healthy sleep cycles and muscle relaxation",
    price: "$18.38",
    rating: "4.7",
    reviewCount: "6,233",
    amazonLink: "https://amzn.to/3LVWB61",
    imageUrl: "https://m.media-amazon.com/images/I/71Q3Z8YZVML._AC_SL1500_.jpg",
    badge: "Overall Pick",
    whyRecommend: "High-absorption formula that promotes feelings of calm and supports a healthy sleep cycle - essential for longevity.",
    triggers: ["sleep", "rest", "insomnia", "relaxation"]
  }
};

// Function to match recommendation to product
function getProductForRecommendation(recommendationText) {
  const text = recommendationText.toLowerCase();
  
  for (const [category, product] of Object.entries(affiliateProducts)) {
    for (const trigger of product.triggers) {
      if (text.includes(trigger)) {
        return product;
      }
    }
  }
  
  return null;
}
