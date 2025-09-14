import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Target,
  Lightbulb,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <MainLayout variant="wide">
      <div className="relative overflow-hidden">
        {/* Add overflow hidden for better animations */}

        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-lg"></div>

        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8 sm:space-y-12">
            <div className="flex justify-center animate-fade-in">
              <Badge
                variant="secondary"
                className="text-sm px-4 py-2 shadow-sm hover:shadow-md transition-all cursor-default"
              >
                <span className="animate-pulse mr-2">🚀</span>
                Now in Beta - Free for Founders
              </Badge>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground animate-slide-up leading-tight">
                Practice Marketing
                <br />
                <span className="relative inline-block text-primary">
                  Campaigns Risk-Free
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in-delay px-4">
                Test your marketing strategies in our virtual lab. Get
                predictive insights, optimize budgets, and perfect your
                campaigns before spending real money.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in-delay-2 px-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 h-12 sm:h-14 w-full sm:w-auto shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <Zap className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/campaign/new">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 h-12 sm:h-14 w-full sm:w-auto border-2 hover:border-primary/50 transition-all duration-300 group"
                >
                  <Target className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform" />
                  Try Demo
                </Button>
              </Link>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Everything You Need to Perfect Your Campaigns
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Our comprehensive platform gives you all the tools to test,
              optimize, and perfect your marketing before you spend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            <Card className="text-center border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Targeting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Define your ideal customer with advanced demographic and
                  interest targeting. Get precise audience insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Get accurate predictions for reach, engagement, and ROI across
                  all channels using industry data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Receive intelligent suggestions to optimize your budget
                  allocation and creative copy for maximum impact.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 sm:py-16">
          <div className="px-4">
            <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-muted/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
              <CardHeader className="text-center relative px-4 sm:px-6 py-6 sm:py-8">
                <Badge variant="outline" className="w-fit mx-auto mb-4">
                  <Shield className="h-3 w-3 mr-1" />
                  Trusted by Founders
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6">
                  Why Adsim?
                </CardTitle>
                <CardDescription className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  Join hundreds of founders who are perfecting their marketing
                  strategies before spending their precious budgets.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative px-4 sm:px-6 pb-6 sm:pb-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Risk-Free Testing
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Experiment with different strategies without burning
                        through your marketing budget. Perfect your approach
                        before going live.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Multi-Channel Insights
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Compare performance across Facebook, Google, Instagram,
                        TikTok, and more. Find your best channels before you
                        spend.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Data-Driven Decisions
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Make informed choices based on predictive analytics and
                        industry benchmarks. No more guesswork in your
                        marketing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Creative Scoring
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Get your ad copy scored and optimized for maximum
                        engagement. Write better ads that convert.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="text-center px-4">
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Ready to Perfect Your Marketing?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Join hundreds of founders who are mastering marketing strategies
                before spending their precious budgets. Start your first
                simulation in under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 h-12 sm:h-14 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                  >
                    <Zap className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    Start Free Trial
                  </Button>
                </Link>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                  <Users className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>No signup required</span>
                  <span>•</span>
                  <span>100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
