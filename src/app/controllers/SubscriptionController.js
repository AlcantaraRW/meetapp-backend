import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';
import File from '../models/File';

class SubscriptionController {
  async index(req, res) {
    const meetups = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'description', 'location', 'date'],
          where: {
            date: {
              [Op.gte]: new Date(),
            },
          },
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: File,
              as: 'image',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [['meetup', 'date']],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.body.meetup_id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You are not allowed to subscribe to your own Meetup' });
    }

    if (meetup.past) {
      return res.status(401).json({
        error:
          'You are not allowed to subscribe to Meetup that is already past',
      });
    }

    const subscriptionData = {
      meetup_id: meetup.id,
      user_id: req.userId,
    };

    const userAlreadySubscribed = await Subscription.findOne({
      where: subscriptionData,
    });

    if (userAlreadySubscribed) {
      return res.status(401).json({
        error: 'You are already subscribed to this Meetup',
      });
    }

    const hasSubscriptionOnSameDate = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (hasSubscriptionOnSameDate) {
      return res.status(401).json({
        error: 'You are already subscribed to a Meetup at the same time',
      });
    }

    const subscription = await Subscription.create({
      ...subscriptionData,
    });

    Queue.add(SubscriptionMail.key, { meetup, user });

    return res.json(subscription);
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription) {
      return res.status(401).json({
        error: 'Subscription not found',
      });
    }

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You are not subscribed to this Meetup',
      });
    }

    subscription.destroy();

    return res.json();
  }
}

export default new SubscriptionController();
