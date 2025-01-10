import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

export default async function handler(req, res) {
  const { shortId } = req.query

  try {
    const { data, error } = await supabase
      .from("urls")
      .select("id, original_url")
      .or(`short_url.eq.${shortId},custom_url.eq.${shortId}`)
      .single()

    if (error || !data) {
      return res.redirect('/')
    }

    // Record the click asynchronously
    const userAgent = req.headers['user-agent']
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress

    // Get location data from IP (you can use a service like ipapi.co here)
    await supabase.from("clicks").insert({
      url_id: data.id,
      device: userAgent?.includes('Mobile') ? 'mobile' : 'desktop',
      // Add other tracking data as needed
    })

    return res.redirect(301, data.original_url)
  } catch (error) {
    console.error('Error:', error)
    return res.redirect('/')
  }
}