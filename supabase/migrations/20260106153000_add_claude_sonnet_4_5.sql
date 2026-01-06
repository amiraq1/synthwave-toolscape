-- Insert Claude Sonnet 4.5 and expose it to all clients
-- Adds a new tool row and appends its id to ChatGPT alternatives

WITH new_tool AS (
  INSERT INTO public.tools (title, description, category, url, image_url, pricing_type, is_featured, created_at)
  VALUES (
    'Claude Sonnet 4.5',
    'نموذج Claude Sonnet 4.5 من Anthropic مع دعم عربي محسّن، قدرة أعلى على الحوار الطويل، وتوليد نصوص إبداعية دقيقة.',
    'نصوص',
    'https://claude.ai',
    NULL,
    'مدفوع',
    true,
    now()
  )
  RETURNING id
)

-- Append the new tool id to ChatGPT alternatives (if ChatGPT row exists)
UPDATE public.tools
SET alternatives = array_append(coalesce(alternatives, '{}'), (SELECT id FROM new_tool))
WHERE LOWER(title) LIKE 'chatgpt';

-- Ensure the new tool is published and visible
UPDATE public.tools
SET is_published = true
WHERE id = (SELECT id FROM new_tool);
