export type LanguageCode = 'en' | 'ta' | 'hi';

export interface TranslationStrings {
  appName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  demoNotice: string;
  nav: {
    dashboard: string;
    forecast: string;
    advisor: string;
    comparison: string;
    weather: string;
    farmerInput: string;
    alerts: string;
    about: string;
  };
  labels: {
    crop: string;
    state: string;
    district: string;
    variety: string;
    quantity: string;
    quintals: string;
    sellingDate: string;
    market: string;
    language: string;
    totalCropsTracked: string;
    currentAvgPrice: string;
    predicted7DayPrice: string;
    bestMarketRec: string;
    expectedProfitPerQtl: string;
    marketPriceChange: string;
    perQuintal: string;
    viewOnMap: string;
    netProfit: string;
    cropPrice: string;
    transportCost: string;
    distance: string;
    recommendation: string;
    marketName: string;
    minExpected: string;
    maxExpected: string;
    avgPredicted: string;
    priceTrend: string;
    confidence: string;
    days7: string;
    days30: string;
    increasing: string;
    decreasing: string;
    stable: string;
    submitAdvice: string;
    setAlert: string;
    downloadCsv: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    appName: 'Smart Crop Advisor',
    welcomeTitle: 'Welcome to Smart Crop Advisor',
    welcomeSubtitle: 'Make smarter farming decisions with AI-powered crop price forecasting.',
    demoNotice: 'Sample Agricultural Dataset Mode: Prices and weather shown are demonstration baselines.',
    nav: {
      dashboard: 'Dashboard',
      forecast: 'Crop Price Forecast',
      advisor: 'Best Market Advisor',
      comparison: 'Market Comparison',
      weather: 'Weather Insights',
      farmerInput: 'Farmer Input',
      alerts: 'Alerts',
      about: 'About Project',
    },
    labels: {
      crop: 'Crop',
      state: 'State',
      district: 'District',
      variety: 'Crop Variety',
      quantity: 'Quantity (Quintals)',
      quintals: 'quintals',
      sellingDate: 'Expected Selling Date',
      market: 'Market',
      language: 'Language',
      totalCropsTracked: 'Total Crops Tracked',
      currentAvgPrice: 'Current Average Price',
      predicted7DayPrice: 'Predicted 7-Day Price',
      bestMarketRec: 'Best Market Recommendation',
      expectedProfitPerQtl: 'Expected Profit / Quintal',
      marketPriceChange: '7-Day Price Outlook',
      perQuintal: '/ quintal',
      viewOnMap: 'View on Map',
      netProfit: 'Net Profit',
      cropPrice: 'Crop Price',
      transportCost: 'Transport Cost',
      distance: 'Distance',
      recommendation: 'Recommendation',
      marketName: 'Market Name',
      minExpected: 'Minimum Expected',
      maxExpected: 'Maximum Expected',
      avgPredicted: 'Average Predicted',
      priceTrend: 'Price Trend',
      confidence: 'Model Confidence',
      days7: 'Next 7 Days',
      days30: 'Next 30 Days',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      stable: 'Stable',
      submitAdvice: 'Get Market Recommendation',
      setAlert: 'Create Price Alert',
      downloadCsv: 'Download CSV',
    },
  },
  ta: {
    appName: 'ஸ்மார்ட் பயிர் ஆலோசகர்',
    welcomeTitle: 'ஸ்மார்ட் பயிர் ஆலோசகருக்கு நல்வரவு',
    welcomeSubtitle: 'AI விலை கணிப்பு மூலம் விவசாயத்தில் சிறந்த லாபகரமான முடிவுகளை எடுங்கள்.',
    demoNotice: 'மாதிரி வேளாண் தரவு: காட்டப்படும் சந்தை விலைகள் மற்றும் வானிலை தகவல்கள் செயல்விளக்கத்திற்கானவை.',
    nav: {
      dashboard: 'முகப்பு',
      forecast: 'விலை கணிப்பு',
      advisor: 'சிறந்த சந்தை ஆலோசகர்',
      comparison: 'சந்தை ஒப்பீடு',
      weather: 'வானிலை தகவல்',
      farmerInput: 'விவசாயி பதிவு',
      alerts: 'விலை எச்சரிக்கைகள்',
      about: 'திட்ட விவரம்',
    },
    labels: {
      crop: 'பயிர்',
      state: 'மாநிலம்',
      district: 'மாவட்டம்',
      variety: 'பயிர் ரகம்',
      quantity: 'அளவு (குவிண்டால்)',
      quintals: 'குவிண்டால்',
      sellingDate: 'விற்பனை தேதி',
      market: 'சந்தை',
      language: 'மொழி',
      totalCropsTracked: 'கண்காணிக்கப்படும் பயிர்கள்',
      currentAvgPrice: 'தற்போதைய சராசரி விலை',
      predicted7DayPrice: '7-நாள் கணிப்பு விலை',
      bestMarketRec: 'சிறந்த சந்தை பரிந்துரை',
      expectedProfitPerQtl: 'எதிர்பார்க்கும் லாபம் / குவிண்டால்',
      marketPriceChange: '7-நாள் விலை மாற்றம்',
      perQuintal: '/ குவிண்டால்',
      viewOnMap: 'வரைபடத்தில் காண்க',
      netProfit: 'நிகர லாபம்',
      cropPrice: 'பயிர் விலை',
      transportCost: 'போக்குவரத்து செலவு',
      distance: 'தூரம்',
      recommendation: 'பரிந்துரை',
      marketName: 'சந்தை பெயர்',
      minExpected: 'குறைந்தபட்ச விலை',
      maxExpected: 'அதிகபட்ச விலை',
      avgPredicted: 'சராசரி கணிப்பு விலை',
      priceTrend: 'விலை போக்கு',
      confidence: 'கணிப்பு நம்பகத்தன்மை',
      days7: 'அடுத்த 7 நாட்கள்',
      days30: 'அடுத்த 30 நாட்கள்',
      increasing: 'உயர்வு',
      decreasing: 'குறைவு',
      stable: 'நிலையானது',
      submitAdvice: 'சந்தை பரிந்துரையைப் பெறுக',
      setAlert: 'விலை எச்சரிக்கை அமைக்கவும்',
      downloadCsv: 'CSV பதிவிறக்கம்',
    },
  },
  hi: {
    appName: 'स्मार्ट फसल सलाहकार',
    welcomeTitle: 'स्मार्ट फसल सलाहकार में आपका स्वागत है',
    welcomeSubtitle: 'AI-आधारित फसल मूल्य पूर्वानुमान के साथ खेती के बेहतर निर्णय लें।',
    demoNotice: 'नमूना कृषि डेटा मोड: दिखाए गए मंडी भाव और मौसम डेटा प्रदर्शन के लिए हैं।',
    nav: {
      dashboard: 'डैशबोर्ड',
      forecast: 'मूल्य पूर्वानुमान',
      advisor: 'सर्वोत्तम मंडी सलाहकार',
      comparison: 'मंडी तुलना',
      weather: 'मौसम जानकारी',
      farmerInput: 'किसान इनपुट',
      alerts: 'मूल्य अलर्ट',
      about: 'परियोजना विवरण',
    },
    labels: {
      crop: 'फसल',
      state: 'राज्य',
      district: 'जिला',
      variety: 'फसल किस्म',
      quantity: 'मात्रा (क्विंटल)',
      quintals: 'क्विंटल',
      sellingDate: 'बिक्री की संभावित तिथि',
      market: 'मंडी',
      language: 'भाषा',
      totalCropsTracked: 'कुल ट्रैक की गई फसलें',
      currentAvgPrice: 'वर्तमान औसत भाव',
      predicted7DayPrice: '7-दिन अनुमानित भाव',
      bestMarketRec: 'सर्वोत्तम मंडी सुझाव',
      expectedProfitPerQtl: 'अनुमानित लाभ / क्विंटल',
      marketPriceChange: '7-दिन मूल्य बदलाव',
      perQuintal: '/ क्विंटल',
      viewOnMap: 'मानचित्र देखें',
      netProfit: 'शुद्ध लाभ',
      cropPrice: 'फसल भाव',
      transportCost: 'परिवहन खर्च',
      distance: 'दूरी',
      recommendation: 'सुझाव',
      marketName: 'मंडी का नाम',
      minExpected: 'न्यूनतम अनुमानित',
      maxExpected: 'अधिकतम अनुमानित',
      avgPredicted: 'औसत अनुमानित',
      priceTrend: 'भाव का रुझान',
      confidence: 'मॉडल विश्वास',
      days7: 'अगले 7 दिन',
      days30: 'अगले 30 दिन',
      increasing: 'बढ़ रहा है',
      decreasing: 'घट रहा है',
      stable: 'स्थिर',
      submitAdvice: 'मंडी सुझाव प्राप्त करें',
      setAlert: 'मूल्य अलर्ट सेट करें',
      downloadCsv: 'CSV डाउनलोड करें',
    },
  },
};
