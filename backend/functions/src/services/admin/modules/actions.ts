import * as express from 'express';
import { bindScenarioToBot, createScenario, updateScenarioActions } from '../../../handlers/actions';
import { createAnalyticSuite } from '../../../handlers/analytic';

const router = express.Router();

router.post('/scenario/create', async (req, res, next) => {
  const { name } = req.body;

  try {
    const id = await createScenario(name);
    await createAnalyticSuite(id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.get('/scenario/:id/bind', async (req, res, next) => {
  const { id } = req.params;
  const { botId } = req.query;
  if (!id || !botId) res.status(400).send(new Error('[id], [botId] are required query params'));

  try {
    await bindScenarioToBot(id, botId as string);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/scenario/:id/update', async (req, res, next) => {
  const { id } = req.params;
  const { stages } = req.body;
  if (!id || !stages) res.status(400).send(new Error('[id], [stages] are required'));

  try {
    await updateScenarioActions(id, (stages || []));
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

export default router;