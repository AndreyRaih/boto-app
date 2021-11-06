import * as express from 'express';
import { createScenario, updateScenarioActions, getScenarioListById } from '../../../handlers/actions';

const router = express.Router();

router.post('/scenario/create', async (req, res, next) => {
  const { name, creatorId } = req.body;
  console.log('here')
  try {
    await createScenario(creatorId, name);
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

router.post('/scenario/:scenarioId/update', async (req, res, next) => {
  const { scenarioId } = req.params;
  const { stages } = req.body;
  if (!scenarioId || !stages) res.status(400).send(new Error('[scenarioId], [stage] are required'));

  try {
    await updateScenarioActions(scenarioId, (stages || []));
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

export default router;