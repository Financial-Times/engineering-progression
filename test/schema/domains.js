'use strict';

module.exports = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$id: 'ft-engineering-competency-domains',
	title: 'Competency domains',
	description: 'A list of competency domains used to track career progression at the Financial Times',
	type: 'array',
	items: {
		$ref: '#/definitions/competencyDomain'
	},
	definitions: {
		competencyDomain: {
			title: 'Competency Domain',
			description: 'A competency domain used to help track career progression at the Financial Times',
			type: 'object',
			properties: {
				id: {
					title: 'ID',
					description: 'A unique identifier for the competency domain',
					type: 'string',
					minLength: 2,
					pattern: '^([a-z\\d]+)(-[a-z\\d]+)*$'
				},
				name: {
					title: 'Name',
					description: 'A human-readable name for the competency domain',
					type: 'string',
					minLength: 5
				},
				summary: {
					title: 'Summary',
					description: 'A short summary of the competency domain',
					type: 'string',
					minLength: 5
				}
			},
			required: [
				'id',
				'name',
				'summary'
			],
			additionalProperties: false
		}
	}
};
