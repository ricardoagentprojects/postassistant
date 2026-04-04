// Next.js API route for waitlist signup
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, company, role } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const backendUrl = (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000'
    ).replace(/\/+$/, '');

    const businessType = [company, role].filter(Boolean).join(' · ') || null;

    const response = await fetch(`${backendUrl}/api/v1/waitlist/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: name || null,
        business_type: businessType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: data.message || 'Thank you for joining the waitlist!',
      position: data.position,
      estimatedWaitTime: data.estimated_wait_time,
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);

    // Check if it's a duplicate email error
    if (error.message && error.message.includes('already registered')) {
      return res.status(200).json({
        success: true,
        message: 'You are already on the waitlist! We will notify you when early access is available.',
        alreadyRegistered: true,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong. Please try again.',
    });
  }
}