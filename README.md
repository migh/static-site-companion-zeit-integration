# Static Site Companion Zeit Integration

## What is this?

This is a [Zeit Integration](https://zeit.co/docs/integrations/) for easily creating sites from headless CMS (like Contentful).
This is the product of first Zeit Integration Hackathon and it is a work in progress.

This integration allows you to:

* Connect a headless CMS with a static site template.
* Automatically deploy this site.
* Update the site whenever the your CMS documents are updated.

## The idea

Static sites are popular for a reason, they allow the right balance of flexibility and performance for a lot of average users with broad but very common requirements.

- The focus is on the data displayed.
- Data does not change that often.
- Data access is not uniform/regular.

Static sites are great because they can be used with serverless and for the average user that will mean savings. The size will be small, the response time can be lowered by using CDN and it is highly scalable.

There is a lot of people with these requirements that is not tech savvy, or is more decision oriented, for them headless CMS make a lot of sense, there you can structure documents around the information model and not care about technical intricacies.

There is still one step that needs to be considered, how to pass from the CMS content to a full featured static site? Zeit platform has a good answer since it offers tools to easily deploy sites, but there are some concepts to grasp for having a functional site. With this integration, you can have the fully functional site first and from there start learning about the process, if you feel like doing it.

## How does it works?

It use a three stage completely independent flow:

1. Sources (CMS)
2. Display (Static site)
3. Deployment

The order of the steps might seems a bit counter-intuitive but it is precissely the point, first you care about your data, then you care about how to communicate or display that data and it is then that you care about glue things together. You shouldn't have to constrain site requirements because of technical aspects as it is commonly the case.

## Development
```bash
  # 1. Create zeit integration and pointing UIHook to http://localhost:5005/uihook
  # 2. Create .env file
  now dev -p 5005
```
As a Zeit integration it is a bit cumbersome to run in development mode, authorization route won't work. You have to create an integration in Zeit and then point to local. Follow their [guide](https://zeit.co/docs/integrations/). Env variables are automatically loaded from `.env` file.

## Deployment
```bash
  # 1. Create zeit integration
  # 2. Create .env file
  now $(./deploy.sh)
```
The only thing `deploy.sh` does is inline environment variables.
You have to set the redirection url to get a OAuth id and secret.
Remember to point redirection and hook url to the real url.