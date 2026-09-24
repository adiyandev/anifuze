import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {recordAnalyticsEvent,getAnalytics} from '../services/analytics.js';
export const analyticsRouter=Router();
analyticsRouter.post('/analytics/events',async(req,res)=>{try{res.status(201).json({ok:true,event:await recordAnalyticsEvent(req.body||{},req)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
analyticsRouter.get('/admin/analytics',requireAdmin,requirePermission('analytics_view'),async(req,res)=>{try{res.json({ok:true,analytics:await getAnalytics({days:req.query.days})});}catch(e){res.status(500).json({ok:false,error:e.message});}});
