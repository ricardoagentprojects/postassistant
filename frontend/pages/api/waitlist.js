// Next.js API route for waitlist signup
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, company, role, platform, budget, referral } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://postassistant.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/v1/waitlist/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || null,
        company: company || null,
        role: role || null,
        primary_platform: platform || null,
        monthly_budget: budget || null,
        referral_source: referral || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Log to console for debugging
    console.log('Waitlist signup successful:', { email, data });

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