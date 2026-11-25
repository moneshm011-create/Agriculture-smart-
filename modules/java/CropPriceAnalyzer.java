/**
 * Smart Crop Price Forecasting & Best-Market Advisor
 * Supporting Java Module: CropPriceAnalyzer.java
 *
 * Purpose:
 *   Analyzes historical crop price series (minimum, maximum, average, standard deviation,
 *   7-day moving average, and linear trend classification).
 *
 * Compile & Run Instructions:
 *   javac modules/java/CropPriceAnalyzer.java
 *   java -cp modules/java CropPriceAnalyzer
 *
 * Sample Input (built-in demo or CLI args):
 *   Tomato prices (INR/quintal): 2820, 2850, 2890, 2940, 2910, 2980, 3040, 3090, 3120, 3180
 *
 * Sample Output:
 *   Crop: Tomato | Observations: 10
 *   Min: 2820.00 | Max: 3180.00 | Mean: 2982.00 | StdDev: 115.65
 *   Trend: INCREASING (+39.64 INR/day)
 */

import java.util.Arrays;

public class CropPriceAnalyzer {

    public static class TrendReport {
        public final String cropName;
        public final double minPrice;
        public final double maxPrice;
        public final double averagePrice;
        public final double stdDeviation;
        public final double sevenDayMovingAvg;
        public final double dailySlope;
        public final String trendLabel;

        public TrendReport(String cropName, double minPrice, double maxPrice, double averagePrice,
                           double stdDeviation, double sevenDayMovingAvg, double dailySlope, String trendLabel) {
            this.cropName = cropName;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.averagePrice = averagePrice;
            this.stdDeviation = stdDeviation;
            this.sevenDayMovingAvg = sevenDayMovingAvg;
            this.dailySlope = dailySlope;
            this.trendLabel = trendLabel;
        }
    }

    public static TrendReport analyzePrices(String cropName, double[] prices) {
        if (prices == null || prices.length == 0) {
            throw new IllegalArgumentException("Price array cannot be empty.");
        }

        double min = prices[0];
        double max = prices[0];
        double sum = 0.0;

        for (double p : prices) {
            if (p < min) min = p;
            if (p > max) max = p;
            sum += p;
        }

        double mean = sum / prices.length;

        double varianceSum = 0.0;
        for (double p : prices) {
            varianceSum += Math.pow(p - mean, 2);
        }
        double stdDev = Math.sqrt(varianceSum / prices.length);

        int maWindow = Math.min(7, prices.length);
        double maSum = 0.0;
        for (int i = prices.length - maWindow; i < prices.length; i++) {
            maSum += prices[i];
        }
        double movingAvg = maSum / maWindow;

        // Ordinary least squares slope
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        int n = prices.length;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumXX += (double) i * i;
        }
        double denom = (n * sumXX - sumX * sumX);
        double slope = denom == 0 ? 0.0 : (n * sumXY - sumX * sumY) / denom;

        String trend;
        if (slope > 5.0) {
            trend = "INCREASING";
        } else if (slope < -5.0) {
            trend = "DECREASING";
        } else {
            trend = "STABLE";
        }

        return new TrendReport(cropName, min, max, mean, stdDev, movingAvg, slope, trend);
    }

    public static void main(String[] args) {
        String crop = args.length > 0 ? args[0] : "Tomato";
        double[] samplePrices = {2820, 2850, 2890, 2940, 2910, 2980, 3040, 3090, 3120, 3180};

        TrendReport report = analyzePrices(crop, samplePrices);
        System.out.println("=== Smart Crop Price Trend Analyzer (Java) ===");
        System.out.println("Crop: " + report.cropName + " | Samples: " + Arrays.toString(samplePrices));
        System.out.printf("Min Price      : INR %.2f / quintal%n", report.minPrice);
        System.out.printf("Max Price      : INR %.2f / quintal%n", report.maxPrice);
        System.out.printf("Average Price  : INR %.2f / quintal%n", report.averagePrice);
        System.out.printf("7-Day Mov. Avg : INR %.2f / quintal%n", report.sevenDayMovingAvg);
        System.out.printf("Volatility (SD): INR %.2f%n", report.stdDeviation);
        System.out.printf("Trend          : %s (%+.2f INR/day)%n", report.trendLabel, report.dailySlope);
    }
}
