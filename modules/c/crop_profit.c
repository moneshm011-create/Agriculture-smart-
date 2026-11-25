/**
 * Smart Crop Price Forecasting & Best-Market Advisor
 * Supporting C Module: crop_profit.c
 *
 * Purpose:
 *   Performs fast crop revenue, transport cost, mandi expense, and net profit calculations.
 *
 * Compile & Run Instructions:
 *   gcc modules/c/crop_profit.c -o crop_profit
 *   ./crop_profit
 *   # Or pass custom arguments: ./crop_profit <price_per_qtl> <quantity_qtl> <distance_km> <rate_per_km> <other_exp>
 *
 * Sample Input:
 *   Price: 3100 INR/qtl, Quantity: 25 qtl, Distance: 175 km, Transport Rate: 18 INR/km, Other Expenses: 1375 INR
 *
 * Sample Output:
 *   Gross Revenue    : INR 77500.00
 *   Transport Cost   : INR 3150.00
 *   Other Expenses   : INR 1375.00
 *   Net Profit       : INR 72975.00
 *   Profit / Quintal : INR 2919.00
 */

#include <stdio.h>
#include <stdlib.h>

typedef struct {
    double price_per_quintal;
    double quantity_quintals;
    double distance_km;
    double transport_rate_per_km;
    double other_expenses;
    double gross_revenue;
    double transport_cost;
    double net_profit;
    double profit_per_quintal;
} CropProfitSummary;

CropProfitSummary calculate_crop_profit(
    double price_per_quintal,
    double quantity_quintals,
    double distance_km,
    double transport_rate_per_km,
    double other_expenses
) {
    CropProfitSummary result;
    result.price_per_quintal = price_per_quintal;
    result.quantity_quintals = quantity_quintals;
    result.distance_km = distance_km;
    result.transport_rate_per_km = transport_rate_per_km;
    result.other_expenses = other_expenses;

    result.gross_revenue = price_per_quintal * quantity_quintals;
    result.transport_cost = distance_km * transport_rate_per_km;
    result.net_profit = result.gross_revenue - result.transport_cost - other_expenses;
    result.profit_per_quintal = (quantity_quintals > 0) ? (result.net_profit / quantity_quintals) : 0.0;
    return result;
}

int main(int argc, char *argv[]) {
    double price = 3100.0;
    double quantity = 25.0;
    double distance = 175.0;
    double rate = 18.0;
    double other_exp = 1375.0;

    if (argc >= 6) {
        price = atof(argv[1]);
        quantity = atof(argv[2]);
        distance = atof(argv[3]);
        rate = atof(argv[4]);
        other_exp = atof(argv[5]);
    }

    CropProfitSummary s = calculate_crop_profit(price, quantity, distance, rate, other_exp);

    printf("=== Smart Crop Profit Calculator (C) ===\n");
    printf("Crop Price       : INR %.2f / quintal\n", s.price_per_quintal);
    printf("Quantity         : %.2f quintals\n", s.quantity_quintals);
    printf("Distance         : %.2f km\n", s.distance_km);
    printf("Gross Revenue    : INR %.2f\n", s.gross_revenue);
    printf("Transport Cost   : INR %.2f\n", s.transport_cost);
    printf("Other Expenses   : INR %.2f\n", s.other_expenses);
    printf("Net Profit       : INR %.2f\n", s.net_profit);
    printf("Profit / Quintal : INR %.2f\n", s.profit_per_quintal);

    return 0;
}
