import { getData, setData, DATA_KEY } from './data';

// GET /api/excel - Load data
export async function GET(request) {
  try {
    let data = await getData();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Initialize with default data if no data exists
      const defaultData = [
        { LOCATION: 'Sample Location', PHONE: '123-456-7890', CONTACT: 'John Doe' }
      ];
      // Try to save to Supabase, but don't fail if it doesn't work
      try {
        await setData(defaultData);
      } catch (e) {
        // Ignore errors when seeding
      }
      data = defaultData;
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API error:', error);
    // Return fallback data on error
    const fallbackData = [
      { LOCATION: 'Sample Location', PHONE: '123-456-7890', CONTACT: 'John Doe' }
    ];
    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/excel - Save all data
export async function PUT(request) {
  try {
    const body = await request.json();
    const dataToSave = body.data || body;
    
    if (!Array.isArray(dataToSave)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const success = await setData(dataToSave);
    
    if (success) {
      return new Response(JSON.stringify({ success: true, message: 'Data saved' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Failed to save' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
