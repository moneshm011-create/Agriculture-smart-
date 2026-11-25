/**
 * Smart Crop Price Forecasting & Best-Market Advisor
 * Supporting C++ Module: market_optimizer.cpp
 *
 * Purpose:
 *   Evaluates multiple agricultural markets and selects the market that yields
 *   the highest estimated Net Profit (rather than merely the highest gross price).
 *
 * Compile & Run Instructions:
 *   g++ -std=c++17 modules/cpp/market_optimizer.cpp -o market_optimizer
 *   ./market_optimizer
 *
 * Sample Input (built-in Tamil Nadu tomato load = 20 quintals from Thanjavur):
 *   6 Tamil Nadu markets with price, distance, and mandi handling fee.
 *
 * Sample Output:
 *   Recommended Best Market: Oddanchatram Market (Net Profit: INR 56175.00)
 */

#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

struct MarketOption {
    std::string name;
    double pricePerQuintal;
    double distanceKm;
    double handlingFeePerQuintal;
    double transportCost = 0.0;
    double otherExpenses = 0.0;
    double netProfit = 0.0;
};

void evaluateMarkets(std::vector<MarketOption>& markets, double quantityQuintals, double transportRatePerKm) {
    int loads = std::max(1, static_cast<int>((quantityQuintals + 24.0) / 25.0));
    for (auto& m : markets) {
        double gross = m.pricePerQuintal * quantityQuintals;
        m.transportCost = m.distanceKm * transportRatePerKm * loads;
        m.otherExpenses = m.handlingFeePerQuintal * quantityQuintals;
        m.netProfit = gross - m.transportCost - m.otherExpenses;
    }

    std::sort(markets.begin(), markets.end(), [](const MarketOption& a, const MarketOption& b) {
        return a.netProfit > b.netProfit;
    });
}

int main() {
    double quantityQuintals = 20.0;
    double transportRatePerKm = 18.0;

    std::vector<MarketOption> markets = {
        {"Koyambedu Market, Chennai", 3240.0, 335.0, 85.0},
        {"Oddanchatram Market", 3120.0, 175.0, 55.0},
        {"Coimbatore Agricultural Market", 3090.0, 265.0, 65.0},
        {"Thanjavur Agricultural Market", 2910.0, 10.0, 45.0},
        {"Madurai Agricultural Market", 3030.0, 192.0, 58.0},
        {"Salem Agricultural Market", 2970.0, 198.0, 50.0}
    };

    evaluateMarkets(markets, quantityQuintals, transportRatePerKm);

    std::cout << "=== Smart Crop Market Optimizer (C++) ===\n";
    std::cout << "Origin: Thanjavur | Crop: Tomato | Quantity: " << quantityQuintals << " quintals\n\n";
    std::cout << std::left << std::setw(34) << "Market Name"
              << std::right << std::setw(12) << "Price/Qtl"
              << std::setw(12) << "Transport"
              << std::setw(14) << "Net Profit" << "\n";
    std::cout << std::string(72, '-') << "\n";

    for (size_t i = 0; i < markets.size(); ++i) {
        const auto& m = markets[i];
        std::cout << std::left << std::setw(34) << m.name
                  << std::right << std::fixed << std::setprecision(2)
                  << std::setw(12) << m.pricePerQuintal
                  << std::setw(12) << m.transportCost
                  << std::setw(14) << m.netProfit
                  << (i == 0 ? "  [BEST MARKET]" : "") << "\n";
    }

    return 0;
}
