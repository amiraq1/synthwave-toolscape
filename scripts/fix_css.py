import re

with open("src/index.css", "r", encoding="utf-8") as f:
    css = f.read()

target = r"""  /\* Optimized Glow Effect - subtle and performant \*/
  \.card-glow \{
    transition: transform 0\.3s cubic-bezier\(0\.4, 0, 0\.2, 1\),
      box-shadow 0\.3s cubic-bezier\(0\.4, 0, 0\.2, 1\),
      border-color 0\.3s ease;
  \}

  \.card-glow:hover \{
    box-shadow: 0 10px 40px -10px rgba\(139, 92, 246, 0\.2\);
    transform: translateY\(-4px\);
    border-color: rgba\(139, 92, 246, 0\.3\);
  \}

  \.card-glow:active \{
    transform: scale\(0\.98\);
  \}"""

replacement = """  /* الحل الطليعي والهندسي لتأثيرات التوهج 100% GPU */
  .card-glow {
    position: relative;
    z-index: 1;
    /* التسريع العتادي للحواف */
    transform: translateZ(0); 
    will-change: transform;
  }

  /* صنع الظل في طبقة سفلى مخفية (أرخص هندسياً بألف مرة من تحريك الظل مباشرة) */
  .card-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.4);
    border: 1px solid rgba(139, 92, 246, 0.3);
    opacity: 0;
    z-index: -1;
    /* نحن نحرك الشفافية فقط، وهذا لا يجبر المتصفح على رسم الشاشة من جديد */
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
  }

  .card-glow:hover::after {
    opacity: 1;
  }

  .card-glow:hover {
    transform: translateY(-4px);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-glow:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }"""

# handle windows crlf by normalizing string
target_regex = "  /\\* Optimized Glow Effect - subtle and performant \\*/[\\s\\S]*?\\.card-glow:active \\{\\n\\s*transform: scale\\(0\\.98\\);\\n\\s*\\}"
import re
new_css = re.sub(target_regex, replacement.replace('\n', '\n'), css.replace('\r\n', '\n'))

with open("src/index.css", "w", encoding="utf-8") as f:
    f.write(new_css)

print("done")
