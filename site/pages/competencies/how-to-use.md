---
title: How to use the Competencies
description: How to use the FT's engineering competencies.
permalink: /competencies/how-to-use/
layout: o-layout-docs
---

# {{page.title}}

Engineering competencies are used to inform conversations about career progression between an engineer and their line manager. They define what an engineer is expected to be doing at a particular level. They are not a checklist, but a way to indicate what areas they may need to improve in. We also expect engineers to be meeting competencies from the levels _before_ their current one.

We divide competencies into levels for different seniorities.

## Levels

Each level represents the expectations and responsibilities that change from one level into another, so the name of each level contains two different job titles:

<ul>
{% for level in site.data.levels %}
	<li>{{level.name}}</li>
{% endfor %}
</ul>

So, for example, a Junior Engineer should be considering the competencies at the "Junior to Mid" level.

## Competencies

Each competency has a summary which is designed to prompt a yes/no response. For each competency, an engineer should feel able to answer either _"yes, I'm meeting this competency"_, or _"no, I'm not meeting this competency, yet"_. An engineer and their line manager should keep a record of evidence for meeting each competency, for example:

<table class="o-table o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th>Competency</th>
		<th>Meeting?</th>
		<th>Evidence</th>
	</tr>
	<tr>
		<td>Contributes to the personal development of more junior people</td>
		<td>Yes</td>
		<td>Has been mentoring a junior member of staff for six months. Ran a department-wide Git workshop</td>
	</tr>
	<tr>
		<td>Leads hiring process for new Engineers</td>
		<td>No</td>
		<td>The team has not had to hire new engineers in the last year, and so this competency cannot be met</td>
	</tr>
</table>

A copy of the <a href="https://docs.google.com/spreadsheets/d/1V0LIbCQtJsi2iowfJnRTDr4Na4LhNAlJ_UHl9dDQs00/edit" class="o-typography-link--external">Engineering Progression Tracker (Google Sheet)</a> is useful for keeping track of progress.

### Domain-specific competencies

Some competencies are domain-specific. This means that the competency is only applicable if an engineer is working in a specific domain. For example, an engineer who builds web pages is expected to know about web accessibility, but we wouldn't expect the same of an engineer who works in operations.

### Examples

Some competencies have one or more examples. The examples are purely illustrative, and will not apply to everyone. When working towards a competency, an engineer does not need to be meeting any of the examples given if they can provide evidence that they are meeting the competency in another way.

### Helpful guidance to filling out your competencies

Please find this article [How do I give great feedback](https://financialtimes.looop.co/#/topic/22629) written by HR that has a helpful guide on how to deliver feedback on yourself or a colleague.
