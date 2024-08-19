import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Thermometer, Droplets, Gauge, Mountain, Calculator } from 'lucide-react';

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
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-sky-700 text-white">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Calculator className="mr-2" />
            Cloud Base Height Calculator
          </span>
          <span className="text-xs">v{VERSION}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-sky-50 p-3 rounded-md">
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
          <div className="flex justify-between items-center bg-sky-50 p-3 rounded-md">
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
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
              <Thermometer className="inline mr-2" size={18} />
              Temperature ({isCelsius ? '°C' : '°F'})
            </label>
            <Input
              id="temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={`Enter temperature in ${isCelsius ? '°C' : '°F'}`}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="dewPoint" className="block text-sm font-medium text-gray-700 mb-1">
              <Droplets className="inline mr-2" size={18} />
              Dew Point ({isCelsius ? '°C' : '°F'})
            </label>
            <Input
              id="dewPoint"
              type="number"
              value={dewPoint}
              onChange={(e) => setDewPoint(e.target.value)}
              placeholder={`Enter dew point in ${isCelsius ? '°C' : '°F'}`}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-1">
              <Gauge className="inline mr-2" size={18} />
              Atmospheric Pressure
            </label>
            <div className="flex space-x-2">
              <Input
                id="pressure"
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                placeholder={`Enter pressure in ${barometerUnit}`}
                className="flex-grow"
              />
              <Select value={barometerUnit} onValueChange={setBarometerUnit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="hPa">hPa</SelectItem>
                  <SelectItem value="inHg">inHg</SelectItem>
                  <SelectItem value="mmHg">mmHg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="elevation" className="block text-sm font-medium text-gray-700 mb-1">
              <Mountain className="inline mr-2" size={18} />
              Airport Elevation ({isMetric ? 'meters' : 'feet'})
            </label>
            <Input
              id="elevation"
              type="number"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
              placeholder={`Enter elevation in ${isMetric ? 'meters' : 'feet'}`}
              className="w-full"
            />
          </div>
          <Button onClick={calculateCloudBase} className="w-full bg-sky-600 hover:bg-sky-700">
            Calculate Cloud Base
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {results && (
            <div className="mt-6 bg-sky-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-3 text-sky-800">Estimated Cloud Base Height:</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Dewpoint Spread Method:</strong> {results.dewpointSpread} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.dewpointSpread} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li><strong>Espy's Method:</strong> {results.espyMethod} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.espyMethod} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li><strong>Accurate LCL Calculation:</strong> {results.accurateLCL} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.accurateLCL} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li><strong>Stüve's Diagram Method:</strong> {results.stuveMethod} {isMetric ? 'meters' : 'feet'} MSL ({results.agl.stuveMethod} {isMetric ? 'meters' : 'feet'} AGL)</li>
                <li><strong>Relative Humidity:</strong> {results.relativeHumidity}%</li>
              </ul>
              <p className="mt-4 text-xs text-gray-600">
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