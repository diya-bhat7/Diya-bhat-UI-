import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Users, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { StraatixLogo } from '@/components/ui/StraatixLogo';

type Position = Tables<'positions'>;
type Company = Tables<'companies'>;

export default function Careers() {
    const { companyId } = useParams<{ companyId: string }>();
    const [positions, setPositions] = useState<Position[]>([]);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!companyId) return;

            try {
                // Fetch company info
                const { data: companyData } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', companyId)
                    .single();

                if (companyData) setCompany(companyData);

                // Fetch active positions
                const { data: posData } = await supabase
                    .from('positions')
                    .select('*')
                    .eq('company_id', companyId)
                    .eq('status', 'active');

                if (posData) setPositions(posData);
            } catch (error) {
                console.error('Error fetching careers data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
                <p className="text-muted-foreground mb-6">The careers page you are looking for doesn't exist.</p>
                <Link to="/">
                    <Button>Return to Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container max-w-6xl mx-auto h-20 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <StraatixLogo size="sm" showText={false} />
                        <div className="h-6 w-px bg-border mx-2" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground leading-tight">{company.company_name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Careers Portal</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-white border-b">
                <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
                    <Badge variant="outline" className="mb-4 py-1 px-3 bg-primary/5 text-primary border-primary/20">
                        We're Hiring!
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
                        Join the team at {company.company_name}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Explore our open opportunities and help us build the future of our industry. We're looking for passionate individuals to join our mission.
                    </p>
                </div>
            </section>

            {/* Positions List */}
            <main className="container max-w-4xl mx-auto py-12 px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Open Positions</h2>
                    <span className="text-sm font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border">
                        {positions.length} active role{positions.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {positions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed p-12 text-center">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No open positions</h3>
                        <p className="text-sm text-muted-foreground">Check back later for new opportunities.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {positions.map((position) => (
                            <Card key={position.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/20">
                                <CardHeader className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-0">
                                                    {position.category}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] font-medium border-emerald-200 text-emerald-700 bg-emerald-50/50">
                                                    {position.work_type}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                                {position.position_name}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {position.preferred_locations?.join(', ') || 'Remote'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {position.num_roles} Role{position.num_roles !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/apply/${position.id}`}>
                                            <Button className="w-full md:w-auto h-11 px-6 group-hover:shadow-lg transition-all">
                                                View Position
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t bg-white">
                <div className="container max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {company.company_name} • Powered by Straatix Partners
                    </p>
                </div>
            </footer>
        </div>
    );
}
