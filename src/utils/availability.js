/**
 * Check if current time falls within user's availability
 * @param {Object} user - User document with availabilityTime
 * @returns {Boolean} - Whether user is available now
 */
function isUserAvailable(user) {
    if (!user.availabilityTime || user.availabilityTime.length === 0) {
      // If no availability set, assume always available
      return true;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Check if current time falls within any availability slot
    return user.availabilityTime.some(slot => {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      
      return currentTimeInMinutes >= startTimeInMinutes && 
             currentTimeInMinutes <= endTimeInMinutes;
    });
  }
  
  module.exports = { isUserAvailable };