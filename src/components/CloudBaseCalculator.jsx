import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const VERSION = "0.0.1"; // Update this when you make changes

const CloudBaseCalculator = () => {
  const [temperature, setTemperature] = useState('');
  const [dewPoint, setDewPoint] = useState('');
  const [pressure, setPressure] = useState('1013.25');
  const [elevation, setElevation] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  const [isMetric, setIsMetric] = useState(true);
  const [barometerUnit, setBarometerUnit] = useState('hPa');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const convertToC = (f) => (f - 32) * (5/9);
  const convertToF = (c) => c * (9/5) + 32;
  const convertToFeet = (m) => m * 3.28084;
  const convertToMeters = (ft) => ft / 3.28084;
  const convertToHPa = (value, unit) => {
    switch (unit) {
      case 'inHg': return value * 33.86389;
      case 'mmHg': return value * 1.33322;
      default: return value;
    }
  };

  const calculateCloudBase = () => {
    setError('');
    let tempC = parseFloat(temperature);
    let dewC = parseFloat(dewPoint);
    let pressureHPa = convertToHPa(parseFloat(pressure), barometerUnit);
    let elevationM = parseFloat(elevation);

    if (isNaN(tempC) || isNaN(dewC) || isNaN(pressureHPa) || isNaN(elevationM)) {
      setError('Please enter valid numbers for all fields.');
      return;
    }

    if (!isCelsius) {
      tempC = convertToC(tempC);
      dewC = convertToC(dewC);
    }

    if (!isMetric) {
      elevationM = convertToMeters(elevationM);
    }

    const spread = tempC - dewC;
    
    if (spread < 0) {
      setError('Dew point cannot be higher than temperature.');
      return;
    }

    // Calculations (in meters)
    const dewpointSpreadMethod = spread * 122;
    const espyMethod = 125 * spread;
    const accurateLCL = calculateAccurateLCL(tempC, dewC, pressureHPa);
    const stuveMethod = 122 * spread * Math.pow((1000 / pressureHPa), 0.286);

    // Relative Humidity
    const Es = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
    const E = 6.112 * Math.exp((17.67 * dewC) / (dewC + 243.5));
    const RH = (E / Es) * 100;

    const convertResult = (value) => isMetric ? value : convertToFeet(value);
    const roundResult = (value) => parseFloat(value.toFixed(2));

    setResults({
        dewpointSpread: roundResult(convertResult(dewpointSpreadMethod) + (isMetric ? elevationM : convertToFeet(elevationM))),
        espyMethod: roundResult(convertResult(espyMethod) + (isMetric ? elevationM : convertToFeet(elevationM))),
        accurateLCL: roundResult(convertResult(accurateLCL) + (isMetric ? elevationM : convertToFeet(elevationM))),
        stuveMethod: roundResult(convertResult(stuveMethod) + (isMetric ? elevationM : convertToFeet(elevationM))),
        relativeHumidity: RH.toFixed(1),
        agl: {
          dewpointSpread: roundResult(convertResult(dewpointSpreadMethod)),
          espyMethod: roundResult(convertResult(espyMethod)),
          accurateLCL: roundResult(convertResult(accurateLCL)),
          stuveMethod: roundResult(convertResult(stuveMethod)),
        }
      });
  };

  const calculateAccurateLCL = (tempC, dewC, pressureHPa) => {
    const L = 2500000; // Latent heat of vaporization of water (J/kg)
    const Rv = 461.5; // Gas constant for water vapor (J/(kg·K))
    const g = 9.8; // Acceleration due to gravity (m/s^2)
    const Cp = 1004; // Specific heat at constant pressure for dry air (J/(kg·K))
    const Γd = 0.00976; // Dry adiabatic lapse rate (K/m)

    const e = 6.11 * Math.exp((17.27 * dewC) / (dewC + 237.3)); // Vapor pressure
    const r = 0.622 * e / (pressureHPa - e); // Mixing ratio
    const Γs = (g * (1 + (L * r) / (Rv * (tempC + 273.15)))) / 
                (Cp + (L * L * r) / (Rv * (tempC + 273.15) * (tempC + 273.15))); // Saturated adiabatic lapse rate

    return (tempC - dewC) / (Γd - Γs);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cloud Base Height Calculator</CardTitle>
        <span className="text-xs text-gray-500">v{VERSION}</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="unit-toggle" className="text-sm font-medium text-gray-700">
              Temperature Unit
            </label>
            <div className="flex items-center space-x-2">
              <span>°C</span>
              <Switch
                id="unit-toggle"
                checked={!isCelsius}
                onCheckedChange={() => setIsCelsius(!isCelsius)}
              />
              <span>°F</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="metric-toggle" className="text-sm font-medium text-gray-700">
              Height Unit
            </label>
            <div className="flex items-center space-x-2">
              <span>Meters</span>
              <Switch
                id="metric-toggle"
                checked={!isMetric}
                onCheckedChange={() => setIsMetric(!isMetric)}
              />
              <span>Feet</span>
            </div>
          </div>
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
              Temperature ({isCelsius ? '°C' : '°F'})
            </label>
            <Input
              id="temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={`Enter temperature in ${isCelsius ? '°C' : '°F'}`}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="dewPoint" className="block text-sm font-medium text-gray-700">
              Dew Point ({isCelsius ? '°C' : '°F'})
            </label>
            <Input
              id="dewPoint"
              type="number"
              value={dewPoint}
              onChange={(e) => setDewPoint(e.target.value)}
              placeholder={`Enter dew point in ${isCelsius ? '°C' : '°F'}`}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="pressure" className="block text-sm font-medium text-gray-700">
              Atmospheric Pressure
            </label>
            <div className="flex space-x-2">
              <Input
                id="pressure"
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                placeholder={`Enter pressure in ${barometerUnit}`}
                className="mt-1 flex-grow"
              />
              <Select value={barometerUnit} onValueChange={setBarometerUnit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hPa">hPa</SelectItem>
                  <SelectItem value="inHg">inHg</SelectItem>
                  <SelectItem value="mmHg">mmHg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="elevation" className="block text-sm font-medium text-gray-700">
              Airport Elevation ({isMetric ? 'meters' : 'feet'})
            </label>
            <Input
              id="elevation"
              type="number"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              placeholder={`Enter elevation in ${isMetric ? 'meters' : 'feet'}`}
              className="mt-1"
            />
          </div>
          <Button onClick={calculateCloudBase} className="w-full">
            Calculate Cloud Base
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {results && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Estimated Cloud Base Height:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Dewpoint Spread Method: {results.dewpointSpread} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.dewpointSpread} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li>Espy's Method: {results.espyMethod} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.espyMethod} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li>Accurate LCL Calculation: {results.accurateLCL} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.accurateLCL} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li>Stüve's Diagram Method: {results.stuveMethod} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.stuveMethod} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li>Relative Humidity: {results.relativeHumidity}%</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Note: MSL = Mean Sea Level, AGL = Above Ground Level. These calculations are based on simplified models and may not account for all atmospheric conditions. Always consult official weather reports for flight planning.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudBaseCalculator;