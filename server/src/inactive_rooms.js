import { getRedis } from './index'

export async function pollForInactiveRooms() {
  const redis = getRedis();

  console.log('Checking for inactive rooms...');
  const rooms = await redis.hgetallAsync('rooms') || {};
  console.log(`${Object.keys(rooms).length} rooms found`);

  Object.keys(rooms).forEach(async roomId => {
    const room = JSON.parse(rooms[roomId]);
    const timeSinceUpdatedInSeconds = (Date.now() - room.updatedAt) / 1000;
    const timeSinceUpdatedInDays = Math.round(timeSinceUpdatedInSeconds / 60 / 60 / 24);
    if (timeSinceUpdatedInDays > 7) {
      console.log(`Deleting roomId ${roomId} which hasn't been used in ${timeSinceUpdatedInDays} days`);
      await redis.hdelAsync('rooms', roomId);
    }
  })

  setTimeout(pollForInactiveRooms, (1000 * 60 * 60 * 12)); // every 12 hours
}
