import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { PullRequest, PullRequestDoc } from "../entities/pull-request.entity";

@Injectable()
export class PullRequestService {
  constructor(
    @InjectModel(PullRequest.name)
    private readonly pullRequestDoc: Model<PullRequestDoc>
  ) {}

  async create(pullRequest: any[]): Promise<any> {
    return await this.pullRequestDoc.insertMany(pullRequest);
  }

  findOne(): Promise<PullRequest> {
    return this.pullRequestDoc.findOne({}).select(["-__v"]).exec();
  }

  count(): Promise<number> {
    return this.pullRequestDoc.countDocuments().exec();
  }

  async aggregate(filename: string): Promise<any> {
    const data = await this.pullRequestDoc
      .aggregate([
        { $match: { "files.nodes": { path: filename } } },
        {
          $facet: {
            open: [
              { $match: { state: "OPEN" } },
              { $group: { "_id": null, count: { $sum: 1 } } },
            ],
            close: [
              { $match: { state: { $in: ["MERGED", "CLOSED"] } } },
              { $group: { "_id": null, count: { $sum: 1 } } }
            ],
            items: [
              { $group: { "_id": null, data: { $push: "$$ROOT" } } }
            ]
          },
        },
        {
          $project: {
            open: {$ifNull: [{ $arrayElemAt: ['$open.count', 0] }, 0]},
            close: {$ifNull: [{ $arrayElemAt: ['$close.count', 0] }, 0]},
            items: {$slice: [{$ifNull: [{ $arrayElemAt: ['$items.data', 0] }, []]}, -3]}            
          },
        },
      ])
      .exec();

      if (data.length > 0) {
        return data[0];
      }
      return data;    
  }
}
