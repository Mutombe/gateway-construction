/* Project portfolio — content from gatewayconstruction.co.zw.
   `region` keys the polygonal map; `img` lists files in assets/img/projects (no extension). */
window.GW_PROJECTS = [
  {
    slug: 'msc', short: 'MSC Harare', title: 'Medical Specialists Centre', sector: 'Healthcare', region: 'harare', location: 'Harare',
    client: 'Medical Specialists Centre',
    scope: 'Multi-storey medical building: reinforced concrete frame, brick infill, curtain-wall glazing and composite cladding.',
    summary: 'A three-storey specialist medical centre taken from brick-and-frame structure through to a glazed, clad façade and finished external works.',
    img: ['msc-00', 'msc-04', 'msc-03', 'msc-01', 'msc-05', 'msc-02']
  },
  {
    slug: 'mazowe', short: 'Mazowe Walk', title: 'Mazowe Walk Shopping Mall', sector: 'Commercial', region: 'mazowe', location: 'Mazowe',
    client: 'Mazowe Walk',
    scope: 'Bulk earthworks, retail block structures, structural steel roofing and a central circular piazza.',
    summary: 'A retail destination built around a circular plaza, from bulk earthworks and platforms to steel-framed retail halls.',
    img: ['mazowe-03', 'mazowe-00', 'mazowe-01']
  },
  {
    slug: 'quinnington', short: 'Quinnington', title: 'Quinnington Housing Project', sector: 'Residential', region: 'harare', location: 'Borrowdale, Harare',
    client: 'Quinnington',
    scope: 'Luxury residential units: structure, timber roof structures, stone cladding, pools and landscaping.',
    summary: 'High-end family homes in a landscaped estate, combining exposed timber roofs, natural stone and generous glazing.',
    img: ['quinnington-02', 'quinnington-00', 'quinnington-04', 'quinnington-03', 'quinnington-01']
  },
  {
    slug: 'otfactory', short: 'OT Factory', title: 'Original Technology Factory', sector: 'Industrial', region: 'harare', location: 'Harare',
    client: 'Original Technology',
    scope: 'Portal-frame steel factory, profiled cladding, industrial floor slab and office annex.',
    summary: 'A large-span steel factory and office block delivered for Original Technology, from portal frames to a column-free production floor.',
    img: ['otfactory-01', 'otfactory-00', 'otfactory-03', 'otfactory-02', 'otfactory-04']
  },
  {
    slug: 'kenilworth', short: 'Kenilworth Road', title: 'Kenilworth Road Rehabilitation', sector: 'Roads & Civil', region: 'harare', location: 'Highlands, Harare',
    client: 'Mimosa Mining Company',
    scope: 'Road rehabilitation, kerbing, road markings, signage and boundary works.',
    summary: 'Rehabilitation of Kenilworth Road with new surfacing, kerbs, markings and boundary walls along the corridor.',
    img: ['kenilworth-03', 'kenilworth-00', 'kenilworth-01', 'kenilworth-02']
  },
  {
    slug: 'eaglesvale', short: 'Eaglesvale', title: 'Eaglesvale Classroom Block', sector: 'Education', region: 'harare', location: 'Harare',
    client: 'Eaglesvale Schools',
    scope: 'New classroom block: face-brick walls, covered walkway, roofing and site works.',
    summary: 'A face-brick classroom block with a shaded colonnade, built on a live school campus with strict safety controls.',
    img: ['eaglesvale-02', 'eaglesvale-04', 'eaglesvale-00', 'eaglesvale-03', 'eaglesvale-01']
  },
  {
    slug: 'zvishavane', short: 'Zvishavane Hospital', title: 'Zvishavane District Hospital', sector: 'Healthcare', region: 'zvishavane', location: 'Zvishavane',
    client: 'Zvishavane District Hospital',
    scope: 'Hospital accommodation blocks, roofing, external paving and site works.',
    summary: 'Single-storey hospital blocks with covered verandas, built to serve the Zvishavane district.',
    img: ['zvishavane-02', 'zvishavane-00', 'zvishavane-01']
  },
  {
    slug: 'shungu', short: 'Shungu Dzevana', title: 'Shungu Dzevana Trust', sector: 'Residential', region: 'zvishavane', location: 'Zvishavane',
    client: 'Shungu Dzevana Trust',
    scope: 'Double-storey residential units, paved courts, roofing and boundary works.',
    summary: 'Double-storey townhouse units for the Shungu Dzevana community trust, finished with paved parking courts.',
    img: ['shungu-01', 'shungu-02', 'shungu-00']
  },
  {
    slug: 'puma', short: 'Puma Offices', title: 'Puma Office Renovations', sector: 'Commercial', region: 'harare', location: 'Harare',
    client: 'Puma Energy',
    scope: 'Office fit-out: glazed partitions, ceilings, lighting, finishes and branded interiors.',
    summary: 'A full office refurbishment with frameless glass partitions, open-plan workstations and new ceilings and lighting.',
    img: ['puma-03', 'puma-01', 'puma-02', 'puma-04', 'puma-00']
  },
  {
    slug: 'bishopslea', short: 'Bishopslea Courts', title: 'Bishopslea Prep Tennis Courts', sector: 'Education', region: 'harare', location: 'Harare',
    client: 'Bishopslea Preparatory School',
    scope: 'Sports courts: base works, acrylic surfacing, line marking and perimeter fencing.',
    summary: 'A bank of resurfaced tennis courts with new acrylic finish, line markings and high perimeter fencing.',
    img: ['bishopslea-03', 'bishopslea-02', 'bishopslea-00']
  },
  {
    slug: 'church', short: 'New Life Church', title: 'New Life Covenant Church', sector: 'Institutional', region: 'harare', location: 'Harare',
    client: 'New Life Covenant Church',
    scope: 'Substructure and frame: setting out, reinforced foundations, column starters and ground slabs.',
    summary: 'A large worship campus rising from the ground up: setting out, reinforced foundations and column starters across the site.',
    img: ['church-02', 'church-03', 'church-00', 'church-01']
  },
  {
    slug: 'fencing', short: 'Gateway Fencing', title: 'Gateway Fencing', sector: 'Roads & Civil', region: 'harare', location: 'Harare',
    client: 'Commercial clients',
    scope: 'High-security mesh fencing, gates and boundary works.',
    summary: 'High-security welded-mesh fencing and gates for commercial and retail premises.',
    img: ['fencing-00', 'fencing-01', 'fencing-02', 'fencing-03']
  }
];

window.GW_REGIONS = {
  harare: { name: 'Harare Metropolitan', lon: 31.05, lat: -17.83, note: 'Head office, 21 Colenbrander, Milton Park' },
  mazowe: { name: 'Mazowe', lon: 30.97, lat: -17.42, note: 'Mashonaland Central' },
  zvishavane: { name: 'Zvishavane', lon: 30.06, lat: -20.33, note: 'Midlands Province' }
};
