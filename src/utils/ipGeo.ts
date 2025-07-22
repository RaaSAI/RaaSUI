export interface IpGeoData {
  ip: string;
  country: string;
  city: string;
  status: string;
}

export const fetchIpGeoData = async (): Promise<IpGeoData | null> => {
  try {
    console.log('Fetching IP and geography data...');
    
    const response = await fetch('https://ip-api.com/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP/Geo data received:', data);

    // Check if the API returned success status
    if (data.status === 'success') {
      return {
        ip: data.query || '',
        country: data.country || '',
        city: data.city || '',
        status: data.status
      };
    } else {
      console.error('IP/Geo API returned error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching IP/Geo data:', error);
    return null;
  }
};
