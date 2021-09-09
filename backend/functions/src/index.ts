'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

import { errorMiddleware } from './middlewares';
import services from './services';

admin.initializeApp()

const app = express();

app.use(errorMiddleware);

app.use('/admin', services);

exports.app = functions.https.onRequest(app);