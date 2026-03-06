import { useState } from "react";
import { CheckCircle, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const Contact = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useSEO({
    title: t("contact.meta_title"),
    description: t("contact.meta_desc"),
    keywords: t("contact.meta_keywords"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: t("contact.toast_title"),
      description: t("contact.toast_desc"),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <EditorialPage>
      <EditorialHero
        eyebrow={t("footer.contact")}
        title={t("contact.title")}
        description={t("contact.subtitle")}
        icon={<Mail className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">CONTACT</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              هل لديك سؤال، اقتراح، أو أداة تستحق الإضافة إلى الدليل؟
            </h2>
            <p className="text-sm leading-7 text-white/70">
              استخدم النموذج أو البريد المباشر. نفضّل الرسائل الواضحة التي تتضمن اسم الأداة، الرابط، وما الذي يجعلها مختلفة فعلًا.
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <EditorialPanel>
          {isSubmitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center space-y-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-editorial text-3xl font-semibold text-slate-950">{t("contact.success_title")}</h2>
                <p className="max-w-md text-sm leading-7 text-slate-600">{t("contact.success_desc")}</p>
              </div>
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="rounded-full border-black/10 bg-white px-5 text-slate-950 hover:bg-white">
                {t("contact.send_another")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-900">
                    {t("contact.name")}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("contact.name_placeholder")}
                    required
                    className="h-12 rounded-2xl border-black/10 bg-white/80"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-900">
                    {t("contact.email")}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    dir="ltr"
                    className="h-12 rounded-2xl border-black/10 bg-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-slate-900">
                  {t("contact.subject")}
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("contact.subject_placeholder")}
                  required
                  className="h-12 rounded-2xl border-black/10 bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-900">
                  {t("contact.message")}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contact.message_placeholder")}
                  required
                  rows={7}
                  className="rounded-[1.6rem] border-black/10 bg-white/80 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t("contact.sending")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    {t("contact.send")}
                  </span>
                )}
              </Button>
            </form>
          )}
        </EditorialPanel>

        <div className="editorial-ink-panel flex flex-col justify-between p-6 sm:p-7">
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">{t("contact.alternative")}</span>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">EMAIL</p>
              <a
                href="mailto:contact@amiraq.org"
                className="mt-3 inline-flex text-lg font-semibold text-white transition-colors hover:text-white/80"
              >
                contact@amiraq.org
              </a>
              <p className="mt-3 text-sm leading-7 text-white/65">
                أرسل الرسالة مباشرة إذا كان لديك تعاون، تصحيح بيانات، أو اقتراح أداة تريد أن نراجعها يدويًا.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EditorialPage>
  );
};

export default Contact;
