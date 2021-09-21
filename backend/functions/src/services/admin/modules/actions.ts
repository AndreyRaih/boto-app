import * as express from 'express';
import { bindScenarioToBot, createScenario, updateScenarioActions, getScenarioListById } from '../../../handlers/actions';
import { createAnalyticSuite } from '../../../handlers/analytic';

const router = express.Router();

router.post('/scenario/create', async (req, res, next) => {
  const { name, creatorId } = req.body;

  try {
    const id = await createScenario(creatorId, name);
    await createAnalyticSuite(id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.get('/scenario/list', async (req, res, next) => {
  const { creatorId } = req.query;

  try {
    const list = await getScenarioListById(creatorId as string);
    res.status(200).send(list);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/scenario/:id/bind', async (req, res, next) => {
  const { id } = req.params;
  const { ids } = req.body;
  if (!id || !ids) res.status(400).send(new Error('[id], [ids] are required query params'));

  try {
    await bindScenarioToBot(id, ids as string[]);
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