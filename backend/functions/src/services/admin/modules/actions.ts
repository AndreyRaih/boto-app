import * as express from 'express';
import { bindScenarioToBot, createScenario, updateScenarioActions, getScenarioListById, deleteScenarioActions } from '../../../handlers/actions';
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

router.post('/scenario/:scenarioId/bind', async (req, res, next) => {
  const { scenarioId } = req.params;
  const { id } = req.body;
  if (!scenarioId || !id) res.status(400).send(new Error('[id], [scenarioId] are required query params'));

  try {
    await bindScenarioToBot(scenarioId, id as string);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/scenario/:scenarioId/update', async (req, res, next) => {
  const { scenarioId } = req.params;
  const { stage } = req.body;
  if (!scenarioId || !stage) res.status(400).send(new Error('[scenarioId], [stage] are required'));

  try {
    await updateScenarioActions(scenarioId, (stage || null));
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/scenario/:scenarioId/delete_stage', async (req, res, next) => {
  const { scenarioId } = req.params;
  const { id } = req.body;
  if (!scenarioId || !id) res.status(400).send(new Error('[scenarioId], [id] are required'));

  try {
    await deleteScenarioActions(scenarioId, id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

export default router;