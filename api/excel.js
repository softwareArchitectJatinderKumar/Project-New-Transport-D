import { getData, setData, DATA_KEY } from './data';

// GET /api/excel - Load data
export async function GET(request) {
  try {
    let data = await getData();
    
    if (!data) {
      // Initialize with default data if no data exists
      const defaultData = [
        { LOCATION: 'Sample Location', PHONE: '123-456-7890', CONTACT: 'John Doe' }
      ];
      await setData(defaultData);
      data = defaultData;
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT /api/excel - Save all data
export async function PUT(request) {
  try {
    const body = await request.json();
    const success = await setData(body.data || body);
    
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
