export class AnalyticsService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async getDashboardAnalytics() {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const metrics = await this.adminRepository.getDashboardMetrics({ monthStart, monthEnd });
    const [recentUsers, recentSubscriptions, recentDraws, recentWinnings] = await this.adminRepository.listRecentActivity();

    const conversionRate = metrics.totalUsers > 0 ? (metrics.activeSubscriptions / metrics.totalUsers) * 100 : 0;
    const avgRevenuePerUser = metrics.totalUsers > 0 ? metrics.lifetimeRevenue / metrics.totalUsers : 0;
    const payoutRatio = metrics.totalPrizePool > 0 ? (metrics.totalWinningsPaid / metrics.totalPrizePool) * 100 : 0;

    return {
      summary: {
        totalUsers: metrics.totalUsers,
        activeSubscriptions: metrics.activeSubscriptions,
        monthlyRevenue: this.round(metrics.monthlyRevenue),
        totalPrizePool: this.round(metrics.totalPrizePool),
        totalWinningsPaid: this.round(metrics.totalWinningsPaid),
        charityContributionTotal: this.round(metrics.charityContributionTotal),
        drawCount: metrics.drawCount,
      },
      metrics: {
        conversionRate: this.round(conversionRate),
        avgRevenuePerUser: this.round(avgRevenuePerUser),
        payoutRatio: this.round(payoutRatio),
        drawStatistics: {
          totalDraws: metrics.drawCount,
        },
        winDistribution: metrics.winDistribution.map((item) => ({
          matchCount: item._id,
          count: item.count,
        })),
      },
      recentActivity: {
        users: recentUsers,
        subscriptions: recentSubscriptions,
        draws: recentDraws,
        winnings: recentWinnings,
      },
    };
  }

  round(value) {
    return Number(Number(value || 0).toFixed(2));
  }
}
