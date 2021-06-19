import { injectable } from "inversify";
//定义了两种烧写模型，一种是Adhoc 独占式 一种是 queue 队列
export class QueueBurnElem {
  model: string = "";
  waitingId: string = (
    Math.random()
      .toString()
      .substring(4, 12) +
    Math.random()
      .toString()
      .substring(4, 12)
  ).toString();
  runtime: number | undefined;
  address: string | undefined;
  filehash: string | undefined;
}
export class AdhocBurnElem {
  clientId: string | undefined;
  devPort: string | undefined;
  waitingId: string = (
    Math.random()
      .toString()
      .substring(4, 12) +
    Math.random()
      .toString()
      .substring(4, 12)
  ).toString();
  runtime: number | undefined;
  address: string | undefined;
  filehash: string | undefined;
}
export class Skeleton {
  type: "QUEUE" | "ADHOC" = "QUEUE";
  groupId: string = (
    Math.random()
      .toString()
      .substring(4, 12) +
    Math.random()
      .toString()
      .substring(4, 12)
  ).toString();
  pid: string | undefined;
  program: QueueBurnElem[] | AdhocBurnElem[] | undefined;
}
@injectable()
export class ProgramBurnDataFactory {
  produceQueueBurnElem(): QueueBurnElem {
    return new QueueBurnElem();
  }
  produceAdhocBurnElem(): AdhocBurnElem {
    return new AdhocBurnElem();
  }

  produceQueueSketon(): Skeleton {
    let skt = new Skeleton();
    skt.type = "QUEUE";
    return skt;
  }
  produceAdhocSketon(): Skeleton {
    let skt = new Skeleton();
    skt.type = "ADHOC";
    return skt;
  }
}
