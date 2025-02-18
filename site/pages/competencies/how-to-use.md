---
title: How to use the Competencies
description: How to use the FT's engineering competencies.
permalink: /competencies/how-to-use/
layout: o-layout-docs
---

# {{page.title}}

Engineering competencies are used to inform conversations about career progression between an engineer and their line manager. They define what an engineer is expected to be doing at a particular level. They are not a checklist, but a way to indicate what areas they may need to improve in.

We divide competencies into levels for different seniorities.

## Levels

Each level within a job family represents the expectations and responsibilities of an engineer at a particular stage of their career at the FT.

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

In the second example the engineer is unable to meet the competency "Leads hiring process for new Engineers" because that opportunity hasn't come up in their current role. This is fine: it's not a requirement for the engineer to be meeting all of the competencies, however this may be an indication to that engineer's line manager that opportunities need to be found or created.

A copy of the relevant spreadsheet is useful for keeping track of progress:

<ul>
	{% for jobFamilyHash in site.data.job-families %}
	{% assign jobFamily = jobFamilyHash[1] %}
		<li>
			<a href="https://docs.google.com/spreadsheets/d/{{jobFamily.googleSheetId}}/edit" class="o-typography-link--external">{{jobFamily.name}}</a>
		</li>
	{% endfor %}
</ul>

### Examples

Some competencies have one or more examples. The examples are purely illustrative, and will not apply to everyone. When working towards a competency, an engineer does not need to be meeting any of the examples given if they can provide evidence that they are meeting the competency in another way.

### Helpful guidance to filling out your competencies

Please find this article [How do I give great feedback](https://financialtimes.looop.co/#/topic/22629) written by HR that has a helpful guide on how to deliver feedback on yourself or a colleague.
