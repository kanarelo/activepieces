import { Trigger } from "@/pieces/framework/src"
import { CopperObjectType } from "../common"
import { copperCrmRegisterTrigger } from "./register"


const triggers: Trigger[][] = [
  {
    displayName: "Lead",
    type: "lead",
    events: ['new'],
    active: true,
    sampleData: {}
  },
  {
    displayName: "Person",
    type: "person",
    events: ['new'],
    active: true,
    sampleData: {}
  },
  {
    displayName: "Company",
    type: "company",
    events: ['new', 'update', 'delete'],
    active: false,
    sampleData: {}
  },
  {
    displayName: "Opportunity",
    type: "opportunity",
    events: ['new'],
    active: true,
    sampleData: {}
  },
  {
    displayName: "Project",
    type: "project",
    events: ['new', 'update', 'delete'],
    active: false,
    sampleData: {}
  },
  {
    displayName: "Task",
    type: "task",
    events: ['new'],
    active: true,
    sampleData: {}
  },
  {
    displayName: "Activity",
    type: "activity_log",
    events: ['new', 'update', 'delete'],
    active: false,
    sampleData: {}
  }
]
.filter(trigger => trigger.active && trigger.events.length > 0)
.map(
  trigger =>
    trigger.events.map((event) =>
      copperCrmRegisterTrigger({
        event,
        displayName: `${trigger.displayName} {}`,
        description: `Triggered on ${event} ${trigger.displayName}`,
        sampleData: trigger.sampleData,
        type: trigger.type as CopperObjectType,
        props: trigger.sampleData
      })
    )
)

export const copperCrmTriggers = ([] as Trigger[]).concat(...triggers)