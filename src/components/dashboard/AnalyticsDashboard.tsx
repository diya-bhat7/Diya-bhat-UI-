import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Loader2, Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#0d2744', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
const STAGE_COLORS = {
    Sourced: '#0d2744',
    Screening: '#2563eb',
    Interview: '#10b981',
    Offer: '#f59e0b',
    Hired: '#8b5cf6',
};

export function AnalyticsDashboard() {
    const { analytics, isLoading } = useAnalytics();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCandidates}</div>
                        <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Successfully Hired</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.hiredCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.totalCandidates > 0
                                ? `${Math.round((analytics.hiredCount / analytics.totalCandidates) * 100)}% conversion rate`
                                : '0% conversion rate'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.avgTimeToHire} Days</div>
                        <p className="text-xs text-muted-foreground mt-1">-2 days from average</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Velocity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Fast</div>
                        <p className="text-xs text-muted-foreground mt-1">High engagement this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hiring Funnel */}
                <Card className="col-span-1 lg:col-span-2 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Hiring Funnel</CardTitle>
                        <CardDescription>Candidate progression through the hiring lifecycle</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.conversionData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="stage"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[0, 4, 4, 0]}
                                    barSize={40}
                                >
                                    {analytics.conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(STAGE_COLORS)[index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Currently in Pipeline</CardTitle>
                        <CardDescription>Current status breakdown of all active candidates</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.statusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.statusBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{analytics.totalCandidates}</span>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Time to Hire Trends */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Time to Hire Trend</CardTitle>
                        <CardDescription>Days taken to move candidate to "Hired" over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.timeToHireData}>
                                <defs>
                                    <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="days"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorDays)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
