import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const TurbulencePotentialCalculator = () => {
  const [temperature, setTemperature] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [season, setSeason] = useState('summer');
  const [environmentType, setEnvironmentType] = useState('lake');
  const [environmentSize, setEnvironmentSize] = useState('medium');
  const [result, setResult] = useState(null);

  const calculateTurbulencePotential = () => {
    let score = 0;

    // Temperature differential (simplified)
    const tempDiff = Math.abs(parseFloat(temperature) - 15); // 15°C as a reference
    score += Math.min(tempDiff / 5, 3);

    // Wind speed
    const wind = parseFloat(windSpeed);
    score += Math.min(wind / 10, 3);

    // Time of day
    score += timeOfDay === 'day' ? 1 : 0;

    // Season
    score += ['summer', 'winter'].includes(season) ? 1 : 0;

    // Environment factor
    const sizeFactor = { small: 0, medium: 1, large: 2 };
    score += sizeFactor[environmentSize];

    const totalScore = Math.min(Math.round(score), 10);

    let potentialCategory;
    if (totalScore <= 3) potentialCategory = "Low";
    else if (totalScore <= 6) potentialCategory = "Moderate";
    else potentialCategory = "High";

    setResult({ score: totalScore, category: potentialCategory });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Turbulence Potential Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
            <Input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Enter temperature"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Wind Speed (knots)</label>
            <Input
              type="number"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              placeholder="Enter wind speed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time of Day</label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select time of day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Season</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Environment Type</label>
            <Select value={environmentType} onValueChange={setEnvironmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lake">Lake</SelectItem>
                <SelectItem value="city">City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Environment Size</label>
            <Select value={environmentSize} onValueChange={setEnvironmentSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={calculateTurbulencePotential} className="w-full">
            Calculate Turbulence Potential
          </Button>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold">Turbulence Potential:</h3>
              <p>Score: {result.score}/10</p>
              <p>Category: {result.category}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TurbulencePotentialCalculator;