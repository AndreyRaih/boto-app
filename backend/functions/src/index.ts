'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

import { errorMiddleware, corsMiddleware } from './middlewares';
import services from './services';

admin.initializeApp()

const app = express();

app.use(errorMiddleware);
app.use(corsMiddleware)

app.use('/api', services);

exports.app = functions.https.onRequest(app);