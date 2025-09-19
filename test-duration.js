// Test function for duration calculation
function calculateEndDate(startDate, duration) {
  // Create a new date object to avoid modifying the original
  const endDate = new Date(startDate);
  
  // If duration is not provided, default to 1 year
  if (!duration) {
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }
  
  // Handle numeric values directly (e.g., 1, 2, 0.5)
  if (!isNaN(parseFloat(duration))) {
    const years = parseFloat(duration);
    // For fractional years, convert to months for more accurate calculation
    if (years % 1 !== 0) {
      // Convert fractional years to months
      const months = Math.round(years * 12);
      endDate.setMonth(endDate.getMonth() + months);
    } else {
      // Whole years
      endDate.setFullYear(endDate.getFullYear() + years);
    }
    return endDate;
  }
  
  // Parse duration string (e.g., "1 year", "6 months", "30 days")
  const durationLower = duration.toLowerCase().trim();
  
  // Handle different duration formats
  if (durationLower.includes('year') || durationLower.includes('years')) {
    const years = parseFloat(durationLower) || 1;
    endDate.setFullYear(endDate.getFullYear() + years);
  } else if (durationLower.includes('month') || durationLower.includes('months')) {
    const months = parseFloat(durationLower) || 1;
    endDate.setMonth(endDate.getMonth() + months);
  } else if (durationLower.includes('day') || durationLower.includes('days')) {
    const days = parseFloat(durationLower) || 30;
    endDate.setDate(endDate.getDate() + days);
  } else {
    // Default to 1 year if format is not recognized
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  return endDate;
}

// Test cases
const startDate = new Date('2025-01-01');

console.log('Start Date:', startDate.toISOString().split('T')[0]);

console.log('Duration: 1 (should be 1 year)');
console.log('End Date:', calculateEndDate(startDate, 1).toISOString().split('T')[0]);

console.log('Duration: 2 (should be 2 years)');
console.log('End Date:', calculateEndDate(startDate, 2).toISOString().split('T')[0]);

console.log('Duration: 0.5 (should be 6 months)');
console.log('End Date:', calculateEndDate(startDate, 0.5).toISOString().split('T')[0]);

console.log('Duration: "1 year" (should be 1 year)');
console.log('End Date:', calculateEndDate(startDate, "1 year").toISOString().split('T')[0]);

console.log('Duration: "6 months" (should be 6 months)');
console.log('End Date:', calculateEndDate(startDate, "6 months").toISOString().split('T')[0]);

console.log('Duration: 1.5 (should be 18 months)');
console.log('End Date:', calculateEndDate(startDate, 1.5).toISOString().split('T')[0]);

console.log('Duration: 0.25 (should be 3 months)');
console.log('End Date:', calculateEndDate(startDate, 0.25).toISOString().split('T')[0]);