import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationResults } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ResultsChartsProps {
  results: SimulationResults;
}

export function ResultsCharts({ results }: ResultsChartsProps) {
  // Process data for charts
  const performanceData = results.timeline?.map((data) => ({
    day: `Day ${data.day}`,
    impressions: data.reach || 0, // Using reach as impressions
    clicks: Math.round((data.reach || 0) * 0.02), // Estimated click-through rate
    conversions: data.conversions || 0,
    spend: data.spend || 0,
  })) || [];

  const channelData = Object.entries(results.channelBreakdown || {}).map(([channel, data]) => ({
    channel: channel,
    impressions: data.reach || 0,
    clicks: Math.round((data.reach || 0) * 0.02), // Estimated clicks from reach
    spend: data.spend || 0,
    conversions: data.conversions || 0,
    roi: data.roi || 0,
    reach: data.reach || 0,
  })) || [];

  const pieData = channelData.map((item, index) => ({
    name: item.channel,
    value: item.spend,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="impressions" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Spend']} />
                    <Bar dataKey="spend" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="channel" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="conversions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Channel ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                    <Bar dataKey="roi" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Spend']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Channel Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel, index) => (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{channel.channel}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${channel.spend.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {channelData.length > 0 ? 
                            `${((channel.spend / channelData.reduce((sum, c) => sum + c.spend, 0)) * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}