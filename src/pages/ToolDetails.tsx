import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Loader2, CheckCircle2, Copy, Tag, Languages, Sparkles, Lightbulb, Target, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import ReviewSection from '@/components/ReviewSection';
import AverageRating from '@/components/AverageRating';
import { useSEO } from '@/hooks/useSEO';
import { useClickTracking } from '@/hooks/useClickTracking';

// ... (existing imports)

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();

  // ... (existing code)

  <a
    href={tool.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => recordClick(tool.id)}
  >
    {tool.pricing_type === 'مجاني' ? (
      <>جرب الأداة مجاناً <ExternalLink className="h-5 w-5" /></>
    ) : tool.pricing_type === 'تجربة مجانية' ? (
      <>ابدأ التجربة المجانية <Sparkles className="h-5 w-5" /></>
    ) : (
      <>زيارة الموقع الرسمي <ExternalLink className="h-5 w-5" /></>
    )}
  </a>
  {
    tool.pricing_type !== 'مجاني' && (
      <p className="text-xs text-muted-foreground mt-3 mr-2">
        * قد يتطلب التسجيل بطاقة ائتمان في بعض المواقع
      </p>
    )
  }
          </div >
        </div >

  {/* Reviews Section */ }
  < div className = "glass rounded-3xl p-8 md:p-12" >
    <ReviewSection toolId={tool.id} />
        </div >
      </main >
    </div >
  );
};

export default ToolDetails;
