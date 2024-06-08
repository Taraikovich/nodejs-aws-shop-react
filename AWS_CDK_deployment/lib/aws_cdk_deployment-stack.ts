import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';

export class CdkDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create CloudFront Origin Access Identity
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "AWS-RSS-OAI");

    // Create S3 bucket
    const siteBucket = new s3.Bucket(this, "aws-rss-task-2-automated", {
      bucketName: "aws-rss-task-2-automated",
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

    // Add policy to bucket to allow CloudFront to read from it
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // Create CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, "aws-rss-task-2-automated-Distribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: siteBucket,
            originAccessIdentity: cloudfrontOAI,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
    });

    // Deploy assets to S3 bucket
    new s3deploy.BucketDeployment(this, "aws-rss-task-2-automated-Deployment", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
