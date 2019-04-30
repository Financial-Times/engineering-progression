---
title: API Documentation
description: Documentation for the engineering competencies JSON API
permalink: /docs/api/
layout: o-layout-docs
---


# {{page.title}}

Engineering competencies are available through a JSON API. This documentation is split into two sections: entities, and endpoints. The entities documentation outlines the objects returned by the API, the endpoints documentation outlines how to _get_ these entities.


## Entities

### Entity: Competency

A Competency entity represents a single engineering competency, they look like this:

<pre><code class="o-syntax-highlight--js">{

	// A unique identifier for the competency
	"id": UUID,

	// A short summary of the competency
	"summary": String,

	// An array of examples of how this competency might be met.
	// This array may be empty, indicating that there are no
	// supporting examples
	"examples": [String],

	// A longer description of the competency. This may be null
	// if the competency has no description
	"description": String,

	// The level that the competency applies to. This will be one
	// of "junior-to-mid", "mid-to-senior1", "senior1-to-senior2",
	// "senior2-to-principal"
	"level": String,

	// The area that the competency is in. This will be one of
	// "technical", "communication", "delivery", "leadership"
	"area": String,

	// The domain that the competency is specific to. This may
	// be null, indicating that the competency applies to all
	// engineers regardless of domain
	"domain": String

}</code></pre>

### Entity: Level

A Level entity represents one of the engineering level boundaries at the FT, e.g. the set of competencies that must be met for a Junior Engineer to progress to a Mid Engineer.

<pre><code class="o-syntax-highlight--js">{

	// The indenfier for the level. This will be one of "junior-to-mid",
	// "mid-to-senior1", "senior1-to-senior2", "senior2-to-principal"
	"id": String,

	// The human-readable name of the level
	"name": String,

	// A single-paragraph summary of what is expected for engineers to
	// move into the next level
	"summary": String,

	// An array of Competency entities. This property is optional, and
	// is not present when requesting all levels
	"competencies": [Competency]

},</code></pre>


## Endpoints

### Get the API version

Get the exact version of the competencies that the API exposes.

#### Request

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Method</th>
		<td>
			<code>GET</code>
		</td>
	</tr>
	<tr>
		<th scope="row">Path</th>
		<td>
			<code>/api/v1/version.json</code>
		</td>
	</tr>
</table>

#### Response

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Status</th>
		<td>
			<code>200</code> on success
		</td>
	</tr>
	<tr>
		<th scope="row">Headers</th>
		<td>
			<dl>
				<dt>Content-Type</dt>
				<dd>
					<code>application/json</code> on success<br/>
					<code>text/html</code> on error
				</dd>
			</dl>
		</td>
	</tr>
	<tr>
		<th scope="row">Body</th>
		<td>
			The current semantic version, as a String. E.g. <code>"1.2.3"</code>
		</td>
	</tr>
</table>

#### Example `curl` command

<pre><code class="o-syntax-highlight--bash">curl https://engineering-progression.ft.com/api/v1/version.json</code></pre>

### Get all competencies

Get all of the competencies for every level as an array. This endpoint responds with an array of [Competency entities](#entity-competency).

#### Request

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Method</th>
		<td>
			<code>GET</code>
		</td>
	</tr>
	<tr>
		<th scope="row">Path</th>
		<td>
			<code>/api/v1/competencies/all.json</code>
		</td>
	</tr>
</table>

#### Response

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Status</th>
		<td>
			<code>200</code> on success
		</td>
	</tr>
	<tr>
		<th scope="row">Headers</th>
		<td>
			<dl>
				<dt>Content-Type</dt>
				<dd>
					<code>application/json</code> on success<br/>
					<code>text/html</code> on error
				</dd>
			</dl>
		</td>
	</tr>
	<tr>
		<th scope="row">Body</th>
		<td>
			Array of <a href="#entity-competency">Competency entities</a>
		</td>
	</tr>
</table>

#### Example `curl` command

<pre><code class="o-syntax-highlight--bash">curl https://engineering-progression.ft.com/api/v1/competencies/all.json</code></pre>

### Get all levels

Get all of the competency levels as an array. This endpoint responds with an array of [Level entities](#entity-level), but these will be returned without the `competencies` property.

#### Request

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Method</th>
		<td>
			<code>GET</code>
		</td>
	</tr>
	<tr>
		<th scope="row">Path</th>
		<td>
			<code>/api/v1/levels/all.json</code>
		</td>
	</tr>
</table>

#### Response

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Status</th>
		<td>
			<code>200</code> on success
		</td>
	</tr>
	<tr>
		<th scope="row">Headers</th>
		<td>
			<dl>
				<dt>Content-Type</dt>
				<dd>
					<code>application/json</code> on success<br/>
					<code>text/html</code> on error
				</dd>
			</dl>
		</td>
	</tr>
	<tr>
		<th scope="row">Body</th>
		<td>
			Array of <a href="#entity-level">Level entities</a>
		</td>
	</tr>
</table>

#### Example `curl` command

<pre><code class="o-syntax-highlight--bash">curl https://engineering-progression.ft.com/api/v1/levels/all.json</code></pre>

### Get competencies by level

Get all of the competencies for a single level, as well as the level information. This endpoint responds with a single [Level entity](#entity-level) which includes the  `competencies` property.

#### Request

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Method</th>
		<td>
			<code>GET</code>
		</td>
	</tr>
	<tr>
		<th scope="row">Path</th>
		<td>
			<code>/api/v1/levels/<var>:level-id</var>.json</code><br/>
			(where <var>:level-id</var> is the unique identifier for a <a href="#entity-level">Level</a>)
		</td>
	</tr>
</table>

#### Response

<table class="o-table o-table--row-headings o-layout__main__single-span" data-o-component="o-table">
	<tr>
		<th scope="row">Status</th>
		<td>
			<code>200</code> on success
		</td>
	</tr>
	<tr>
		<th scope="row">Headers</th>
		<td>
			<dl>
				<dt>Content-Type</dt>
				<dd>
					<code>application/json</code> on success<br/>
					<code>text/html</code> on error
				</dd>
			</dl>
		</td>
	</tr>
	<tr>
		<th scope="row">Body</th>
		<td>
			<a href="#entity-level">Level entity</a>
		</td>
	</tr>
</table>

#### Example `curl` command

<pre><code class="o-syntax-highlight--bash">curl https://engineering-progression.ft.com/api/v1/levels/junior-to-mid.json</code></pre>
