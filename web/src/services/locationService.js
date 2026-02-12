// Location and Healthcare Facility Service

// Emergency Helplines Database
export const EMERGENCY_HELPLINES = {
    india: {
        country: 'India',
        helplines: [
            { name: 'Emergency Services', number: '112', description: 'All emergency services' },
            { name: 'Ambulance', number: '102', description: 'Medical emergency ambulance' },
            { name: 'Police', number: '100', description: 'Police emergency' },
            { name: 'Fire', number: '101', description: 'Fire emergency' },
            { name: 'Women Helpline', number: '1091', description: 'Women in distress' },
            { name: 'Child Helpline', number: '1098', description: 'Child emergency' },
            { name: 'Mental Health', number: '9152987821', description: 'Vandrevala Foundation 24/7' },
            { name: 'Poison Control', number: '1800-11-4000', description: 'National Poison Information Centre' },
        ]
    },
    us: {
        country: 'United States',
        helplines: [
            { name: 'Emergency Services', number: '911', description: 'All emergency services' },
            { name: 'Poison Control', number: '1-800-222-1222', description: 'Poison emergency' },
            { name: 'Suicide Prevention', number: '988', description: 'Suicide & Crisis Lifeline' },
            { name: 'Mental Health Crisis', number: '1-800-950-6264', description: 'NAMI Helpline' },
        ]
    },
    uk: {
        country: 'United Kingdom',
        helplines: [
            { name: 'Emergency Services', number: '999', description: 'All emergency services' },
            { name: 'NHS Non-Emergency', number: '111', description: 'Medical advice' },
            { name: 'Samaritans', number: '116 123', description: 'Mental health support' },
        ]
    },
    default: {
        country: 'International',
        helplines: [
            { name: 'Emergency Services', number: '112', description: 'International emergency number' },
            { name: 'Local Emergency', number: '911 or 999', description: 'Check your local emergency number' },
        ]
    }
};

// Get user's current location with improved error handling and fallback
export const getUserLocation = async () => {
    return new Promise(async (resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        // Check permission state first
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            console.log('📍 Location permission state:', permissionStatus.state);

            if (permissionStatus.state === 'denied') {
                reject(new Error('Location permission was previously denied. Please reset location permissions in your browser settings.'));
                return;
            }
        } catch (permError) {
            console.warn('⚠️ Could not check permission state:', permError);
            // Continue anyway, some browsers don't support permissions API
        }

        // Try with high accuracy first
        const tryGetLocation = (enableHighAccuracy, timeoutMs) => {
            return new Promise((res, rej) => {
                console.log(`📍 Attempting to get location (highAccuracy: ${enableHighAccuracy}, timeout: ${timeoutMs}ms)...`);

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('✅ Location acquired successfully:', {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                            accuracy: position.coords.accuracy + 'm'
                        });
                        res({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        });
                    },
                    (error) => {
                        console.error('❌ Location error:', {
                            code: error.code,
                            message: error.message
                        });

                        let errorMessage = 'Unable to retrieve location';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location permission denied. Please enable location access in your browser.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information unavailable. Please check your device settings.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out. Please try again.';
                                break;
                        }
                        rej(new Error(errorMessage));
                    },
                    {
                        enableHighAccuracy: enableHighAccuracy,
                        timeout: timeoutMs,
                        maximumAge: 0
                    }
                );
            });
        };

        try {
            // First attempt: High accuracy with 30 second timeout
            const location = await tryGetLocation(true, 30000);
            resolve(location);
        } catch (firstError) {
            console.warn('⚠️ High accuracy attempt failed, trying with lower accuracy...');

            // If high accuracy fails and it's not a permission denial, try with lower accuracy
            if (!firstError.message.includes('denied')) {
                try {
                    const location = await tryGetLocation(false, 30000);
                    resolve(location);
                } catch (secondError) {
                    reject(secondError);
                }
            } else {
                reject(firstError);
            }
        }
    });
};

// Search nearby hospitals using OpenStreetMap Nominatim API
export const searchNearbyHospitals = async (latitude, longitude, radius = 5000) => {
    try {
        // Using Overpass API for OpenStreetMap data
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
        way["amenity"="hospital"](around:${radius},${latitude},${longitude});
        node["amenity"="clinic"](around:${radius},${latitude},${longitude});
        way["amenity"="clinic"](around:${radius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch nearby hospitals');
        }

        const data = await response.json();

        // Process and format results
        const facilities = data.elements
            .filter(element => element.tags && element.tags.name)
            .map(element => {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    element.lat || element.center?.lat,
                    element.lon || element.center?.lon
                );

                return {
                    name: element.tags.name,
                    type: element.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
                    address: formatAddress(element.tags),
                    phone: element.tags.phone || 'N/A',
                    emergency: element.tags.emergency === 'yes',
                    distance: distance,
                    latitude: element.lat || element.center?.lat,
                    longitude: element.lon || element.center?.lon
                };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Return top 10 closest

        return facilities;

    } catch (error) {
        console.error('Error searching hospitals:', error);
        throw error;
    }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

// Format address from OSM tags
const formatAddress = (tags) => {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

// Get emergency helplines based on country (default to India)
export const getEmergencyHelplines = (countryCode = 'india') => {
    return EMERGENCY_HELPLINES[countryCode] || EMERGENCY_HELPLINES.default;
};

// Reverse geocode to get location name
export const getLocationName = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'NeuraHealth/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get location name');
        }

        const data = await response.json();
        const address = data.address;

        return {
            city: address.city || address.town || address.village || 'Unknown',
            state: address.state || '',
            country: address.country || '',
            displayName: data.display_name
        };

    } catch (error) {
        console.error('Error getting location name:', error);
        return {
            city: 'Unknown',
            state: '',
            country: '',
            displayName: 'Location unavailable'
        };
    }
};
