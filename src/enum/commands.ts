import { model } from '../commands/model'
import { reset } from '../commands/reset'
import { rule } from '../commands/rule'

export enum Command {
  MODEL = 'model',
  RULE = 'rule',
  RESET = 'reset',
}

export const commands = [model.data, rule.data, reset.data]
