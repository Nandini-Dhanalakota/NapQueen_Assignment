import { Request, Response } from 'express';
import { Event } from '../models/event';
import { startOfDay, endOfDay } from 'date-fns';

export const registerEntry = async (req: Request, res: Response) => {
  try {
    const { personId, gate } = req.body;
    const event = new Event({ personId, gate, type: 'entry' });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerExit = async (req: Request, res: Response) => {
  try {
    const { personId, gate } = req.body;
    const event = new Event({ personId, gate, type: 'exit' });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentPeople = async (req: Request, res: Response) => {
  try {
    const entries = await Event.aggregate([
      { $match: { type: 'entry' } },
      { $group: { _id: '$personId', lastEntry: { $max: '$timestamp' } } }
    ]);

    const exits = await Event.aggregate([
      { $match: { type: 'exit' } },
      { $group: { _id: '$personId', lastExit: { $max: '$timestamp' } } }
    ]);

    const peopleInBuilding = entries.filter(entry => {
      const exit = exits.find(exit => exit._id === entry._id);
      return !exit || entry.lastEntry > exit.lastExit;
    });

    res.status(200).json(peopleInBuilding.map(entry => entry._id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { personId, startDate, endDate } = req.query;
    const start = startOfDay(new Date(startDate as string));
    const end = endOfDay(new Date(endDate as string));

    const history = await Event.find({
      personId,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalEntries = await Event.countDocuments({ type: 'entry' });
    const totalExits = await Event.countDocuments({ type: 'exit' });
    const currentPeople = totalEntries - totalExits;

    const avgDurationCursor = await Event.aggregate([
      { $match: { type: 'entry' } },
      {
        $lookup: {
          from: 'events',
          let: { personId: '$personId', entryTime: '$timestamp' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$personId', '$$personId'] }, { $eq: ['$type', 'exit'] }] } } },
            { $project: { duration: { $subtract: ['$timestamp', '$$entryTime'] } } }
          ],
          as: 'durations'
        }
      },
      { $unwind: '$durations' },
      { $group: { _id: null, avgDuration: { $avg: '$durations.duration' } } }
    ]);

    const avgDuration = avgDurationCursor.length ? avgDurationCursor[0].avgDuration : 0;

    const peakTimes = await Event.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const peakTime = peakTimes.length ? peakTimes[0]._id : null;

    const mostUsedGates = await Event.aggregate([
      {
        $group: {
          _id: '$gate',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const mostUsedGate = mostUsedGates.length ? mostUsedGates[0]._id : null;

    res.status(200).json({ currentPeople, avgDuration, peakTime, mostUsedGate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
