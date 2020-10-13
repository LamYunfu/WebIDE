import {  Client } from './groveproxy'
export const GroveService =Symbol("GroveService")
export interface GroveService{
    setClient(client:Client):void
    pushDotMatrix(sentence:string):void;
}