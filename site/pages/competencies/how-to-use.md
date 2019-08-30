---
title: How to use the Competencies
description: How to use the FT's engineering competencies.
permalink: /competencies/how-to-use/
layout: o-layout-docs
---


# {{page.title}}

Engineering competencies are used to help identify when an engineer is ready for promotion. We divide competencies into levels.

## Levels

Each level represents the work needed to be promoted from one role into another, so the name of each level contains two different job titles:

<ul>
{% for level in site.data.levels %}
	<li>{{level.name}}</li>
{% endfor %}
</ul>

So, for example, a Junior Engineer should be working towards the competencies at the "Junior to Mid" level.

When putting forward an engineer for a promotion, you are expected to provide evidence that you're meeting the competencies for the new level. We also expect engineers to be meeting competencies from the levels _before_ their current one, but we do not require evidence of this in a promotions round.

## Competencies

Each competency has a summary which is designed to prompt a yes/no response. For each competency, an engineer should feel able to answer either _"yes, I'm meeting this competency"_, or _"no, I'm not meeting this competency yet"_.

In order to be promoted, an engineer must specify which competencies they are meeting for a level. We don't expect that _every_ engineer will meet _all_ of the competencies, but the promotions board will consider all of the competencies when making a decision. Domain-specific competencies that don't apply to an engineer's role or specialism will not be considered as part of a promotions case.

Engineers are expected to provide evidence that they are meeting a competency when it comes to writing a promotions case. We expect a sentence or two, and an engineer's line manager should be ready to provide further detail if necessary. It's fine to use the same evidence for multiple competencies. Evidence must also be provided for competencies that are not being met to explain why they have not or cannot be met.

An example of how you might provide evidence for met and unmet competencies:

<table class="o-table o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th>Competency</th>
		<th>Done?</th>
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
