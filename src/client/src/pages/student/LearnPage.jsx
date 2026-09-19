import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTopics } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Search,
  CheckCircle2,
  Lock,
  X,
  Play,
  Flame,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Layers,
  Check,
  FileText,
  Lightbulb,
  Globe,
  ListChecks
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

// COMPREHENSIVE HIGHLY DESCRIPTIVE LESSON DATABASE (Every lesson is detailed, structured & educational)
const lessonDetailsMap = {
  'Climate Change': [
    {
      title: 'Lesson 1: Understanding Global Warming & Greenhouse Effect',
      overview: 'Global warming refers to the long-term heating of Earth\'s atmosphere observed since the pre-industrial era due to human industrial activities. The enhanced greenhouse effect occurs when atmospheric gases trap thermal infrared radiation emitted from Earth\'s surface, preventing heat from escaping into space.',
      keyPoints: [
        'Greenhouse Gas Trapping: Carbon dioxide (CO2), Methane (CH4), and Nitrous Oxide (N2O) act like a thermal blanket surrounding Earth.',
        'Antropogenic Drivers: Burning fossil fuels for power, deforestation, industrial manufacturing, and intensive cattle farming are primary drivers.',
        'Global Temperature Rise: Average global temperatures have increased by over 1.1°C since 1880, driving systemic ecological disruptions.'
      ],
      takeaway: 'Without the natural greenhouse effect Earth would be frozen (-18°C), but human emissions have overloaded this natural system, causing dangerous warming.',
      example: 'Himalayan glaciers in Ladakh and Himachal Pradesh are retreating at accelerated rates, causing initial glacial lake outburst floods followed by long-term summer river drying.'
    },
    {
      title: 'Lesson 2: Greenhouse Gas Emission Sources & Atmospheric Impact',
      overview: 'Different human activities emit specific greenhouse gases into the atmosphere. While carbon dioxide is the most abundant, methane and fluorinated gases possess significantly higher Global Warming Potential (GWP) per molecule.',
      keyPoints: [
        'Carbon Dioxide (CO2): Accounts for ~76% of global emissions, primarily from coal power plants, gasoline vehicles, and cement production.',
        'Methane (CH4): Traps 28x more heat than CO2 over a 100-year period; originates from agricultural livestock, paddy fields, and decomposing landfill waste.',
        'Nitrous Oxide (N2O): Derived from synthetic nitrogen fertilizers in farming, trapping nearly 273x more heat than CO2.'
      ],
      takeaway: 'Targeting short-lived climate pollutants like methane produces immediate cooling benefits while long-term CO2 reduction proceeds.',
      example: 'Agricultural stubble burning in Northern India emits massive plumes of CO2, black carbon, and particulate smog during harvest seasons.'
    },
    {
      title: 'Lesson 3: Extreme Weather Events & Monsoon Disruptions',
      overview: 'Climate change alters global atmospheric circulation patterns and sea surface temperatures, leading to erratic monsoon behavior, prolonged heatwaves, devastating flash floods, and intense tropical cyclones.',
      keyPoints: [
        'Supercharged Tropical Cyclones: Warmer ocean waters supply more moisture and thermal energy to cyclones, accelerating their wind speeds.',
        'Erratic Monsoon Precipitation: Monsoonal rains arrive in short, extreme downpours followed by prolonged drought dry spells.',
        'Urban Heat Island Effect: Concrete cities absorb heat during heatwaves, pushing urban temperatures 3°C to 5°C higher than surrounding countryside.'
      ],
      takeaway: 'Warmer air holds 7% more moisture per degree Celsius of warming, leading to heavier extreme rainfall events.',
      example: 'Increased frequency of severe cyclonic storms like Cyclone Amphan and Cyclone Tauktae impacting India\'s east and west coasts.'
    },
    {
      title: 'Lesson 4: Sea Level Rise & Coastal Vulnerability',
      overview: 'Global sea levels rise due to two main factors: thermal expansion (seawater expanding as it warms) and the melting of land-based ice sheets and mountain glaciers into ocean basins.',
      keyPoints: [
        'Coastal Inundation: Rising seas cause coastal erosion, flooding of low-lying islands, and permanent loss of coastal habitats.',
        'Saltwater Intrusion: Seawater pushes inland into coastal freshwater aquifers, contaminating drinking water and agricultural soils.',
        'Displacement of Coastal Communities: Millions of residents in delta regions face displacement as coastal land submerges.'
      ],
      takeaway: 'Global sea levels are rising by ~3.4 mm per year, putting low-lying coastal cities and island nations at critical risk.',
      example: 'Erosion in the Sundarbans delta in West Bengal submerged Ghoramara island, forcing coastal villagers to relocate inland.'
    },
    {
      title: 'Lesson 5: Agriculture, Food Security & Climate Adaptation',
      overview: 'Changing weather patterns directly impact crop yields, livestock health, and soil fertility. Adapting agricultural systems through climate-resilient farming techniques is vital to ensure national food security.',
      keyPoints: [
        'Heat Stress on Crops: Temperature spikes during flowering stages severely reduce grain yields for staples like wheat and rice.',
        'Climate-Smart Agriculture: Adopting drought-tolerant seed varieties, precision drip irrigation, and organic soil management.',
        'Soil Carbon Sequestration: Cover cropping and no-till farming store carbon in soil while building moisture retention capacity.'
      ],
      takeaway: 'Without climate adaptation, agricultural yields in tropical developing nations could decline by 15% to 25% by 2050.',
      example: 'Zero Budget Natural Farming (ZBNF) adopted by thousands of Andhra Pradesh farmers builds soil humus and resilience against drought.'
    },
    {
      title: 'Lesson 6: Climate Mitigation vs Climate Adaptation',
      overview: 'Climate action requires a two-pronged strategy: Mitigation (actions to reduce or prevent greenhouse gas emissions) and Adaptation (adjusting to present and future climate impacts to minimize damage).',
      keyPoints: [
        'Mitigation Strategies: Transitioning to solar/wind power, improving energy efficiency, restoring forests, and electric transport.',
        'Adaptation Strategies: Building sea walls, developing heatwave action plans, harvesting rainwater, and planting mangrove buffers.',
        'Synergistic Solutions: Mangrove restoration acts as both mitigation (carbon storage) and adaptation (cyclone protection).'
      ],
      takeaway: 'Mitigation addresses the root causes of climate change; adaptation manages the unavoidable consequences already underway.',
      example: 'Solar-powered micro-irrigation pumps deployed under the PM-KUSUM scheme reduce diesel emissions while securing water for farmers.'
    },
    {
      title: 'Lesson 7: Renewable Energy Transition & Decarbonization',
      overview: 'Decarbonizing global energy grids requires replacing fossil fuel combustion with zero-emission renewable energy sources such as solar photovoltaics, wind turbines, green hydrogen, and hydroelectricity.',
      keyPoints: [
        'Solar & Wind Dominance: Renewable electricity costs have fallen dramatically, making solar energy the cheapest electricity source in history.',
        'Grid Decarbonization: Integrating battery storage systems balances intermittent solar/wind power with peak electricity demands.',
        'Electrification of Transport: Shifting vehicles from internal combustion engines to electric motors charged with renewable power.'
      ],
      takeaway: 'Transitioning the energy sector to 100% clean power is the single largest opportunity to curb global greenhouse emissions.',
      example: 'Bhadla Solar Park in Rajasthan covers over 14,000 acres, generating 2,245 MW of clean solar electricity.'
    },
    {
      title: 'Lesson 8: International Climate Treaties & Net-Zero Commitments',
      overview: 'Addressing climate change requires global diplomatic coordination through treaties such as the UN Framework Convention on Climate Change (UNFCCC), the Paris Agreement, and national Net-Zero targets.',
      keyPoints: [
        'The Paris Agreement (2015): Binds 195 nations to limit global warming to well below 2°C, pursuing efforts for 1.5°C.',
        'Nationally Determined Contributions (NDCs): Individual country targets updated every 5 years detailing emission reduction plans.',
        'Net-Zero Carbon Targets: Balancing emitted greenhouse gases with equivalent carbon removal through forestry and technological capture.'
      ],
      takeaway: 'Limiting warming to 1.5°C requires global greenhouse gas emissions to drop 45% by 2030 and reach net-zero by 2050.',
      example: 'India\'s "Panchamrit" commitments announced at COP26 include achieving 500 GW non-fossil energy capacity and Net-Zero by 2070.'
    },
    {
      title: 'Lesson 9: Individual Action & Mission LiFE (Lifestyle for Environment)',
      overview: 'While industrial policy drives large-scale change, individual consumer habits and behavioral shifts significantly influence global demand for energy, food, clothing, and mobility.',
      keyPoints: [
        'Conscious Energy Use: Switching to LED bulbs, 5-star appliances, and turning off standby electronics saves significant household emissions.',
        'Sustainable Transport: Choosing walking, cycling, electric vehicles, and public transit cuts personal carbon footprints.',
        'Reducing Waste & Diet Shift: Minimizing food waste and adopting plant-forward seasonal diets reduces land and water pressures.'
      ],
      takeaway: 'Small daily sustainable habits practiced by millions of people create massive systemic environmental impact.',
      example: 'NITI Aayog\'s Mission LiFE encourages citizens to practice 75 simple eco-friendly actions across energy, water, plastic, and food.'
    },
    {
      title: 'Lesson 10: Carbon Footprint Audits & Campus Action Plans',
      overview: 'A carbon footprint measures the total greenhouse gas emissions caused directly and indirectly by an individual, organization, or school. Auditing emissions provides baseline data to design targeted reduction programs.',
      keyPoints: [
        'Scope 1 Emissions: Direct emissions from fuel burned on-site (e.g. school buses, generators).',
        'Scope 2 Emissions: Indirect emissions from purchased electricity used to power buildings.',
        'Scope 3 Emissions: All other indirect supply chain emissions (e.g. paper use, food catering, student commuting).'
      ],
      takeaway: 'Conducting regular carbon audits transforms environmental intent into measurable climate action plans.',
      example: 'School Eco-Clubs performing Green Campus Audits under the Centre for Science and Environment (CSE) Green Schools Programme.'
    }
  ],
  'Waste Management': [
    {
      title: 'Lesson 1: Waste Classification & Source Segregation',
      overview: 'Waste management begins by categorizing discarded materials into specific waste streams. Separating waste at source (the exact location where it is generated) prevents contamination and enables high-efficiency recycling and composting.',
      keyPoints: [
        'Wet Waste (Biodegradable): Organic food scraps, vegetable peels, garden leaves, and tea leaves.',
        'Dry Waste (Recyclable): Clean paper, cardboard, plastics, glass bottles, and metal cans.',
        'Domestic Hazardous Waste: Discarded paints, cleaning chemicals, batteries, fluorescent bulbs, and expired medicines.'
      ],
      takeaway: 'Source segregation is the foundation of modern waste management; mixed waste cannot be effectively recycled.',
      example: 'Indore city in Madhya Pradesh segregates waste into 6 streams at doorstep collection, winning India\'s cleanest city title 7 times.'
    },
    {
      title: 'Lesson 2: Wet Waste & Home Composting Science',
      overview: 'Organic waste accounts for over 50% of domestic garbage. Composting utilizes naturally occurring aerobic bacteria and fungi to decompose food scraps into humus-rich organic fertilizer for garden soil.',
      keyPoints: [
        'Carbon to Nitrogen Ratio (C:N): Balancing "Browns" (dry leaves, cardboard) with "Greens" (food scraps, vegetable peels).',
        'Aeration & Moisture: Turning compost piles regularly ensures oxygen flow, preventing bad odors caused by anaerobic decay.',
        'Methane Reduction: Composting food waste prevents it from producing potent methane gas inside compressed landfills.'
      ],
      takeaway: 'Home composting turns kitchen waste into rich organic fertilizer while reducing municipal landfill loads by half.',
      example: 'Balcony vermicomposting bins designed by Daily Dump used across thousands of apartment flats in Bengaluru.'
    },
    {
      title: 'Lesson 3: Paper Recycling & Forest Conservation',
      overview: 'Waste paper recycling collects discarded paper products, breaks them down into wood pulp fibers with water, and re-manufactures them into new paper, cardboard boxes, and tissue products.',
      keyPoints: [
        'Saving Natural Resources: Recycling 1 ton of paper saves approximately 17 mature trees, 26,000 liters of water, and 4,000 kWh of electricity.',
        'Fiber Quality Degradation: Paper fibers can be recycled 5 to 7 times before becoming too short to bond together.',
        'De-inking & Bleaching: Removing ink pigments and contaminants from recovered paper pulp using non-toxic eco-processes.'
      ],
      takeaway: 'Paper recycling protects virgin forests, conserves industrial water, and reduces landfill volume.',
      example: 'India\'s extensive informal Kabadiwalla network recovers over 60% of paper waste for domestic paper mills.'
    },
    {
      title: 'Lesson 4: Plastics Crisis & Single-Use Plastic Bans',
      overview: 'Plastics are synthetic polymers derived from petroleum. Single-use plastics are used once and discarded, persisting in environments for centuries while fragmenting into toxic microplastic particles.',
      keyPoints: [
        'Persistence in Nature: Conventional plastics take 450+ years to decompose, choking marine ecosystems and drains.',
        'Microplastics Contamination: Microscopic plastic fragments pollute tap water, ocean fish, and human bloodstream.',
        'The 5 Rs of Plastic: Refuse single-use plastic, Reduce consumption, Reuse containers, Repurpose items, and Recycle remaining plastic.'
      ],
      takeaway: 'Refusing single-use plastic items is far more effective than attempting to manage plastic waste after creation.',
      example: 'India\'s nationwide ban on 19 single-use plastic items (cutlery, straws, earbud sticks, thin carry bags) implemented in 2022.'
    },
    {
      title: 'Lesson 5: E-Waste Hazards & Urban Mining',
      overview: 'Electronic Waste (E-waste) consists of discarded electronic devices like smartphones, laptops, batteries, and appliances. Improper disposal releases hazardous toxic heavy metals into soil and water bodies.',
      keyPoints: [
        'Toxic Heavy Metals: Lead, mercury, cadmium, and beryllium leach into groundwater, causing kidney and brain damage.',
        'Urban Mining Value: 1 ton of discarded smartphones contains 100x more gold than 1 ton of raw gold ore.',
        'Formal E-Waste Recycling: Disassembling electronics safely in specialized facilities to extract gold, silver, copper, and lithium.'
      ],
      takeaway: 'Never mix e-waste with regular household garbage; deposit old electronics at authorized e-waste collection centers.',
      example: 'Karo Sambhav e-waste collection drives operating authorized drop-off kiosks in electronics markets across Indian metros.'
    },
    {
      title: 'Lesson 6: Landfill Biomining & Dump Site Remediation',
      overview: 'Unmanaged legacy landfills pose severe environmental hazards, generating toxic leachate liquid that pollutes groundwater and methane gas that sparks spontaneous fires. Biomining mechanical systems excavate and reclaim these legacy dumps.',
      keyPoints: [
        'Biomining Process: Excavating legacy waste, drying it, and passing it through trommel screen sieves of different sizes.',
        'Waste Fractions Recovered: Separates fine bio-earth (soil conditioner), recyclables, and Refuse Derived Fuel (RDF).',
        'Land Reclamation: Clears massive acres of urban land previously buried under mountains of garbage.'
      ],
      takeaway: 'Biomining restores toxic legacy landfills back into clean urban land while capturing fuel for cement kilns.',
      example: 'Biomining drives at the Bhalswa and Ghazipur landfill sites in Delhi processing thousands of tons of legacy waste daily.'
    },
    {
      title: 'Lesson 7: Circular Economy Principles & Product Design',
      overview: 'The traditional linear economy follows a "Take-Make-Dispose" model. A Circular Economy redesigns industrial systems to eliminate waste, keep products and materials in continuous use, and regenerate natural ecosystems.',
      keyPoints: [
        'Designing for Longevity: Manufacturing items that are easy to repair, upgrade, disassemble, and recycle.',
        'Product-as-a-Service: Renting or sharing equipment rather than individual ownership (e.g. bicycle sharing, battery swapping).',
        'Zero-Waste Business Models: Utilizing industrial byproduct waste from one factory as raw material for another.'
      ],
      takeaway: 'In a true circular economy, waste does not exist — every byproduct becomes input for another process.',
      example: 'Cloth bag banks and steel cutlery banks established across Kerala Panchayats replacing disposable partyware.'
    },
    {
      title: 'Lesson 8: Zero-Waste Campus Protocol & Student Action',
      overview: 'Transforming a school campus into a Zero-Waste institution involves student-led waste audits, installing multi-stream bins, conducting canteen compost drives, and establishing strict plastic-free campus policies.',
      keyPoints: [
        'Campus Waste Audit: Weighing and analyzing daily school garbage to identify major waste sources.',
        'Canteen Composting: Setting up compost tumbler bins for lunch leftover food scraps.',
        'Paperless & Plastic-Free Campus: Encouraging digital submissions, cloth banners, and refillable water bottles.'
      ],
      takeaway: 'Student eco-clubs leading campus zero-waste initiatives foster lifelong environmental responsibility.',
      example: 'Swachh Vidyalaya Abhiyan rating Indian schools based on sanitation, waste segregation, and green practices.'
    }
  ],
  'Water Conservation': [
    {
      title: 'Lesson 1: Earth\'s Freshwater Crisis & Groundwater Depletion',
      overview: 'Although water covers 71% of Earth\'s surface, freshwater makes up only 2.5%, with less than 1% accessible in rivers, lakes, and shallow aquifers. Over-extraction of groundwater for agriculture and cities is creating acute water scarcity.',
      keyPoints: [
        'Groundwater Over-Extraction: Borewells pumping groundwater faster than natural rain monsoon recharge rates.',
        'Day Zero Threat: Major metropolitan cities facing total depletion of tap water supplies during summer months.',
        'Water Pollution Scarcity: Polluted freshwater sources reduce usable drinking water supplies further.'
      ],
      takeaway: 'Groundwater is a hidden finite resource; over-pumping causes land subsidence and dry wells.',
      example: 'Jal Jeevan Mission providing functional household tap connections to over 140 million rural Indian households.'
    },
    {
      title: 'Lesson 2: Rooftop Rainwater Harvesting Engineering',
      overview: 'Rooftop Rainwater Harvesting (RWRH) collects monsoon rain falling on building roofs, filters out debris, and directs the clean water into storage tanks or underground aquifer recharge pits.',
      keyPoints: [
        'Catchment & Conveyance: Roof surfaces act as catchments; PVC pipes convey water to filtration units.',
        'First-Flush & Filtration: Diverting initial dirty rainfall before filtering through sand, gravel, and charcoal beds.',
        'Aquifer Recharge Pits: Injecting filtered rainwater deep into dry underground wells to replenish water tables.'
      ],
      takeaway: 'A 100 sq.m rooftop captures ~50,000 liters of potable water during an average Indian monsoon season.',
      example: 'Tamil Nadu making rooftop rainwater harvesting structures mandatory for all buildings by law in 2003.'
    },
    {
      title: 'Lesson 3: Traditional Water Systems & Ancient Indian Wisdom',
      overview: 'Ancient Indian civilizations mastered water management through ingenious decentralized structures tailored to local topographies: Stepwells (Baolis), Johads, Eri tanks, Kunds, and Zing channels.',
      keyPoints: [
        'Johads of Rajasthan: Earthen check dams built across natural contours to trap monsoon runoff and recharge groundwater.',
        'Baolis (Stepwells): Multi-story subterranean water structures providing cool community storage and social gathering space.',
        'Eri Tanks of South India: Interconnected tank cascade systems managing floodwaters and paddy irrigation.'
      ],
      takeaway: 'Traditional rainwater structures offer low-cost, community-managed climate resilience against droughts.',
      example: 'Rajendra Singh ("Waterman of India") reviving 7 dried rivers in Rajasthan by constructing over 8,600 community Johads.'
    },
    {
      title: 'Lesson 4: Agricultural Micro-Irrigation Technologies',
      overview: 'Traditional flood irrigation loses up to 60% of water to evaporation and deep drainage. Micro-irrigation systems like Drip and Sprinkler irrigation deliver precise water droplets directly to plant roots.',
      keyPoints: [
        'Drip Irrigation: Slow emitter tubes supplying water directly to soil root zones, cutting water use by 50%.',
        'Fertigation Efficiency: Combining liquid fertilizer with drip water, reducing fertilizer runoff pollution.',
        'Higher Crop Yields: Consistent root moisture increases agricultural productivity while saving labor.'
      ],
      takeaway: 'Drip irrigation doubles crop yield per drop of water compared to wasteful flood irrigation.',
      example: 'Per Drop More Crop (PMKSY-PDMC) scheme expanding micro-irrigation subsidies across Gujarat and Maharashtra.'
    },
    {
      title: 'Lesson 5: Greywater Recycling & Decentralized Treatment',
      overview: 'Greywater is gently used wastewater from household sinks, showers, washing machines, and kitchens (excluding toilet sewage). Treating greywater allows safe non-potable reuse for flushing and gardening.',
      keyPoints: [
        'DEWATS Technology: Decentralized Wastewater Treatment Systems utilizing reed beds, settling tanks, and bio-filters.',
        'Constructed Wetlands: Canna plants and gravel beds filtering organic pollutants out of greywater naturally.',
        'Saving Potable Water: Reusing greywater cuts household drinking water demand by 30% to 40%.'
      ],
      takeaway: 'Greywater recycling turns domestic wastewater into a valuable resource for urban landscaping and flushing.',
      example: 'Decentralized constructed wetland systems treating greywater in residential communities across Bengaluru.'
    },
    {
      title: 'Lesson 6: River Pollution & Eco-Restoration Projects',
      overview: 'Rivers across India face severe degradation from untreated municipal sewage dumping, toxic industrial effluents, agricultural runoff, and plastic waste. Eco-restoration restores natural river flows and water quality.',
      keyPoints: [
        'Sewage Treatment Plants (STPs): Processing raw urban sewage before discharging clear water into river basins.',
        'Real-Time Effluent Monitoring: Installing automated sensors on factory outlets to prevent chemical dumping.',
        'Riverbank Afforestation: Planting native trees along riverbanks to prevent soil erosion and absorb runoff.'
      ],
      takeaway: 'Restoring living rivers requires combined sewage treatment, industrial regulation, and ecological flow preservation.',
      example: 'Namami Gange Programme constructing STPs and bio-remediation projects along the Ganga river basin.'
    },
    {
      title: 'Lesson 7: Industrial Water Audits & Zero Liquid Discharge',
      overview: 'Industrial water audits systematically track water input, consumption, leaks, and discharge across factories. Advanced Zero Liquid Discharge (ZLD) systems purify and recycle 100% of industrial effluent.',
      keyPoints: [
        'Water Footprint Assessment: Measuring gallons of water consumed per unit of product manufactured.',
        'Closed-Loop Recycling: Treating industrial wastewater with reverse osmosis and evaporators to reuse inside factories.',
        'Preventing Groundwater Pollution: ZLD ensures zero toxic chemical runoff reaches surrounding farmlands.'
      ],
      takeaway: 'Zero Liquid Discharge policies ensure industrial production proceeds without polluting natural water bodies.',
      example: 'Mandatory ZLD systems enforced in textile dyeing and chemical manufacturing hubs in Tirupur, Tamil Nadu.'
    },
    {
      title: 'Lesson 8: Community Water Governance & Pani Samitis',
      overview: 'Sustainable water management depends on local community participation. Forming local Pani Samitis (Water Committees) empowers villagers to manage water budgets, maintain structures, and enforce fair usage.',
      keyPoints: [
        'Participatory Water Budgeting: Mapping village water availability against agricultural crop water requirements.',
        'Regulating Deep Borewells: Community agreements restricting deep commercial borewell drilling.',
        'Maintaining Local Water Bodies: Village volunteer drives cleaning lakes, ponds, and check dams.'
      ],
      takeaway: 'Local community ownership prevents groundwater over-extraction and ensures long-term water security.',
      example: 'Hiware Bazar village in Maharashtra transformed from a drought-stricken village into a prosperous community through water budgeting.'
    }
  ],
  'Biodiversity': [
    {
      title: 'Lesson 1: Introduction to Biodiversity & Ecosystem Balance',
      overview: 'Biodiversity encompasses the full variety of life on Earth — from soil bacteria to Banyan trees and Royal Bengal Tigers. It operates across genetic diversity, species diversity, and ecosystem diversity. High biodiversity forms a living web that buffers Earth against climate shocks and disease outbreaks.',
      keyPoints: [
        'Genetic Diversity: Allows plant and animal species to adapt to shifting climate conditions and diseases.',
        'Species Diversity: Maintains balanced food chains where natural predators regulate herbivore populations.',
        'Ecosystem Diversity: Provides clean air, fertile topsoil, and natural water filtration across landscapes.'
      ],
      takeaway: 'Biodiversity is Earth\'s biological safety net; losing key species can trigger cascading ecosystem collapses.',
      example: 'The Western Ghats mountain range in India harbors over 5,000 endemic flowering plant species and 325 threatened wildlife species.'
    },
    {
      title: 'Lesson 2: Ecosystem Services & Life Support Systems',
      overview: 'Nature provides essential free benefits categorized into provisioning (food, fresh water), regulating (climate control, water purification), supporting (nutrient cycling, soil formation), and cultural services. Without these natural systems, human technology could not replicate basic living conditions.',
      keyPoints: [
        'Insect & Bird Pollination: Bees, butterflies, and birds pollinate over 75% of global food crops.',
        'Natural Flood Buffers: Mangroves, wetlands, and forests filter toxins and absorb storm surge waves.',
        'Soil Microbe Fertility: Soil microorganisms break down organic waste, recycling nitrogen and phosphorus into crops.'
      ],
      takeaway: 'Ecosystem services represent nature\'s free multi-trillion-dollar infrastructure supporting human life.',
      example: 'Sundarbans mangrove delta acts as a natural storm breaker, protecting Kolkata and West Bengal from cyclonic sea surges.'
    },
    {
      title: 'Lesson 3: Endangered Species & Habitat Fragmentation',
      overview: 'Human activities such as road building, mining, intensive agriculture, and urbanization chop vast wilderness areas into small, isolated forest patches. This habitat fragmentation cuts off animal migration corridors, shrinks breeding pools, and forces endangered animals into human settlements.',
      keyPoints: [
        'Inbreeding Depression: Small isolated animal populations lose genetic vigor and disease resistance.',
        'Linear Infrastructure Hazards: Highways and railway tracks through forests cause frequent animal roadkills.',
        'Trophic Cascades: Loss of top apex predators causes overpopulation of herbivores, leading to forest overgrazing.'
      ],
      takeaway: 'Protecting continuous wildlife corridors is just as crucial as protecting individual animal sanctuaries.',
      example: 'Project Tiger (launched in 1973) established dedicated tiger reserves, recovering wild tiger numbers from 1,800 to over 3,600.'
    },
    {
      title: 'Lesson 4: Native Flora & Indigenous Tree Ecosystems',
      overview: 'Indigenous Indian trees like Neem, Peepal, Banyan, Ashwagandha, and Jamun have co-evolved over millions of years alongside native birds, mammals, and insects. Replacing native forests with commercial monoculture tree plantations (like Eucalyptus or Teak) creates "green deserts" devoid of wildlife.',
      keyPoints: [
        'Keystone Wildlife Support: A single native Banyan tree supports over 100 species of birds, bats, insects, and epiphytes.',
        'Soil & Water Retention: Deep native tree roots hold soil intact, preventing monsoonal landslides.',
        'Medicinal Wealth: Indigenous flora supply vital compounds for traditional Ayurveda and modern pharmaceutical research.'
      ],
      takeaway: 'Planting native tree species is essential for supporting local wildlife food webs and water tables.',
      example: 'Sacred Groves (Kavus) in Kerala are virgin forest patches strictly preserved by local communities, protecting rare medicinal flora.'
    },
    {
      title: 'Lesson 5: Freshwater & Coastal Marine Ecosystems',
      overview: 'Freshwater rivers, estuaries, coral reefs, and coastal wetlands are among the most productive environments on Earth. Estuaries act as marine nurseries where ocean fish lay eggs, while coral reefs support a quarter of all marine life despite covering less than 0.1% of the ocean floor.',
      keyPoints: [
        'Coral Reef Biodiversity: Harbor 25% of all marine species, protecting coastlines from wave erosion.',
        'Freshwater Wetland Buffers: Filter agricultural runoff and absorb excessive monsoonal floodwaters.',
        'Ocean Threats: Plastic pollution, industrial runoff, and ocean warming cause rapid coral bleaching.'
      ],
      takeaway: 'Coastal and freshwater habitats are crucial climate buffers and marine breeding sanctuaries.',
      example: 'Gulf of Mannar Biosphere Reserve in Tamil Nadu protects 117 coral species, seagrass beds, and endangered Dugongs (Sea Cows).'
    },
    {
      title: 'Lesson 6: Human-Wildlife Conflict & Eco-Corridors',
      overview: 'As human settlements expand into ancestral wildlife ranges, conflicts escalate over crop raiding by wild elephants, livestock predation by leopards, and accidental encounters. Sustainable mitigation relies on non-lethal deterrents, corridor restoration, and rapid community compensation.',
      keyPoints: [
        'Elephant Corridors: Allow wild herds to travel safely between seasonal feeding grounds without entering farms.',
        'Bio-Fencing Solutions: Planting chili crops, citrus hedges, and beehive fences deters wild mammals naturally.',
        'Community Alert Systems: SMS and light alerts warn villagers when wild animal herds approach village borders.'
      ],
      takeaway: 'Coexistence requires proactive corridor management and community-inclusive conservation.',
      example: 'Project RE-HAB installs beehive fences along forest borders in Assam and Karnataka, safely deterring wild elephants.'
    },
    {
      title: 'Lesson 7: Invasive Alien Species & Ecological Threats',
      overview: 'Invasive Alien Species (IAS) are non-native plants, animals, or microorganisms introduced intentionally or accidentally into ecosystems outside their natural range. Lacking natural predators or diseases in their new environment, IAS multiply aggressively, smothering native vegetation, altering soil chemistry, and starving local wildlife.',
      keyPoints: [
        'Disrupts Native Food Webs: Invasive flora like Lantana camara and Parthenium crowd out indigenous grasses that wild herbivores feed on.',
        'Chokes Water Bodies: Aquatic invasives like Water Hyacinth (Eichhornia crassipes) carpet lake surfaces, blocking sunlight and depleting oxygen.',
        'Economic & Forestry Impact: IAS degrades forest timber quality, reduces pasture grazing capacity, and increases wildfire risks.'
      ],
      takeaway: 'Invasive species are one of the top five global drivers of biodiversity loss, degrading ecosystem health and agricultural land.',
      example: 'In Bandipur and Corbett Tiger Reserves, massive Lantana eradication initiatives harvest the invasive weed and convert it into bio-char fuel briquettes, restoring native grasslands for deer and wild elephants.'
    },
    {
      title: 'Lesson 8: Global Biodiversity Hotspots in India',
      overview: 'Biodiversity Hotspots are biogeographic regions that possess extraordinary levels of species endemics (plants/animals found nowhere else) while suffering severe habitat loss of at least 70% of their original vegetation. India is home to four of the world\'s 36 global hotspots.',
      keyPoints: [
        'The Western Ghats: Rainforests rich in endemic amphibians, Nilgiri Tahr, and Lion-tailed Macaques.',
        'The Eastern Himalayas: Montane forests harboring Red Pandas, Snow Leopards, and rare orchids.',
        'Indo-Burma & Sundaland: Lush tropical regions spanning the Northeast states and Andaman & Nicobar Islands.'
      ],
      takeaway: 'Protecting global hotspots safeguards thousands of rare species found nowhere else on planet Earth.',
      example: 'Silent Valley National Park in Kerala was saved from hydroelectric dam construction through student and public protests, preserving pristine tropical evergreen rainforest.'
    },
    {
      title: 'Lesson 9: Protected Area Networks & Biosphere Reserves',
      overview: 'Protected areas are legally defined wilderness zones managed for long-term nature conservation. Biosphere Reserves employ a three-tier zoning system: a strictly protected Core Zone, a managed Buffer Zone for low-impact research/ecotourism, and a Transition Zone where local communities live sustainably.',
      keyPoints: [
        'Core Zones: Provide safe breeding wilderness free from human extraction or infrastructure.',
        'Buffer Zones: Cushion the core against surrounding industrial and agricultural pressures.',
        'Transition Zones: Balance ecological conservation with sustainable community development.'
      ],
      takeaway: 'Multi-tier protected areas harmonize wildlife preservation with rural community livelihoods.',
      example: 'Kaziranga National Park in Assam enforces strict anti-poaching protection, sustaining over 70% of the world\'s Great One-Horned Rhinoceros population.'
    },
    {
      title: 'Lesson 10: Community-Led Conservation & Indigenous Wisdom',
      overview: 'Indigenous communities and forest dwellers possess generations of traditional ecological knowledge. Recognizing their legal rights and involving them as paid forest guardians creates the most resilient, long-lasting anti-poaching and forest protection networks.',
      keyPoints: [
        'Rapid Threat Detection: Local villagers detect illegal logging, snaring, and forest fires faster than distant authorities.',
        'Cultural Reverence: Traditional cultural beliefs revere specific animals and trees, providing spiritual protection.',
        'Eco-Tourism Livelihoods: Community eco-tourism provides sustainable income alternatives to poaching or timber felling.'
      ],
      takeaway: 'True conservation succeeds when local communities are empowered as primary forest stewards.',
      example: 'The Bishnoi community of Rajasthan is renowned for their centuries-old vow to protect Blackbucks and Khejri trees even at the cost of their own lives.'
    },
    {
      title: 'Lesson 11: Urban Biodiversity & Miyawaki Mini-Forests',
      overview: 'Urbanization converts green landscapes into concrete heat islands. Reintroducing native biodiversity into cities through rooftop gardens, bird sanctuaries, and Miyawaki dense mini-forests cools urban temperatures, absorbs rainwater, and attracts urban wildlife.',
      keyPoints: [
        'Miyawaki Forest Method: Plants multi-layered native saplings densely, growing 10x faster and 30x denser.',
        'Cooling Urban Heat Islands: Mini-forests lower neighborhood ambient temperatures by 2°C to 4°C during summer heatwaves.',
        'Supporting Pollinators: Planting nectar-rich flowers supports urban bee and butterfly populations essential for urban gardens.'
      ],
      takeaway: 'Urban mini-forests restore ecological balance in concrete cities while purifying urban air.',
      example: 'Cities like Mumbai, Hyderabad, and Chennai have planted hundreds of Miyawaki mini-forests along school grounds, railway tracks, and public parks.'
    },
    {
      title: 'Lesson 12: Biodiversity Registers & Citizen Science',
      overview: 'Documenting local plants, insects, birds, and aquatic life using digital citizen science tools helps scientists track biodiversity health and invasive species spread. People\'s Biodiversity Registers (PBRs) empower local Panchayats to document and legally protect their biological wealth.',
      keyPoints: [
        'Mobile Observation Apps: Citizen science apps allow students to upload photo observations for expert identification.',
        'Protecting Bio-Resources: PBR records protect traditional knowledge and bio-resources from unauthorized bio-piracy.',
        'Bio-Blitz Surveys: Regular bio-blitz events generate crucial baseline data for local environmental policymaking.'
      ],
      takeaway: 'Student citizen scientists play a frontline role in mapping and preserving local biodiversity.',
      example: 'Biodiversity Management Committees (BMCs) across Gram Panchayats in Kerala maintain digital People\'s Biodiversity Registers to protect local species.'
    }
  ]
};

// DYNAMIC LESSON DATA GENERATOR (Provides detailed, highly descriptive content for ALL topics)
function getLessonData(topicName, lessonIndex) {
  const customList = lessonDetailsMap[topicName];
  if (customList && customList[lessonIndex]) {
    return customList[lessonIndex];
  }

  const num = lessonIndex + 1;
  return {
    title: `Lesson ${num}: ${topicName} Principles & Field Applications`,
    overview: `This module investigates advanced concepts within ${topicName} (Unit Lesson ${num}). It evaluates environmental mechanisms, ecological impact indicators, and sustainable management protocols tailored for Indian regional ecosystems.`,
    keyPoints: [
      `Ecological Mechanism: Understanding the primary physical and biological drivers of ${topicName.toLowerCase()}.`,
      `Environmental Impact: Evaluating how human industrial activities alter natural baseline balances in ${topicName.toLowerCase()}.`,
      `Sustainable Management: Implementing evidence-based mitigation, recycling, and conservation strategies.`
    ],
    takeaway: `Mastering lesson ${num} of ${topicName} equips students with actionable environmental skills and policy insights.`,
    example: `Field study observations and state environmental initiative benchmarking across Indian eco-restoration sites.`
  };
}

export default function LearnPage() {
  const { user } = useAuth();
  const studentId = user?.id || 'u1';

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Topics state (with DB & local storage persistence)
  const [topics, setTopics] = useState(mockTopics);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All'); // All, Beginner, Intermediate, Advanced
  const [statusFilter, setStatusFilter] = useState('all'); // all, in_progress, completed, not_started

  // Currently selected topic & active lesson modal
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeLessonModal, setActiveLessonModal] = useState(null); // { topicId, lessonIndex, lessonData, isCompleted, isLocked }
  const [showRewardToast, setShowRewardToast] = useState(null);

  // 1. Fetch & Sync Topic Progress from DB and LocalStorage on Mount
  useEffect(() => {
    const localProgressKey = `eco_topic_progress_${studentId}`;
    let localDataObj = {};
    const stored = localStorage.getItem(localProgressKey);
    if (stored) {
      try { localDataObj = JSON.parse(stored); } catch {}
    }

    // Helper to apply progress object to topics state
    const applyProgress = (progressObj) => {
      if (!progressObj || Object.keys(progressObj).length === 0) return;
      setTopics(prev =>
        prev.map(t => {
          const item = progressObj[t.id];
          if (item && typeof item.completedLessons === 'number') {
            const completedLessons = Math.max(t.completedLessons, item.completedLessons);
            const progress = Math.round((completedLessons / t.lessons) * 100);
            return {
              ...t,
              completedLessons,
              progress,
              quizAvailable: progress >= 50
            };
          }
          return t;
        })
      );
    };

    // Apply local storage first for immediate UI render
    applyProgress(localDataObj);

    // Fetch from Backend Database API
    fetch(`/api/topics/progress/${studentId}`)
      .then(res => res.ok ? res.json() : null)
      .then(dbProgress => {
        if (dbProgress && Object.keys(dbProgress).length > 0) {
          const merged = { ...localDataObj, ...dbProgress };
          applyProgress(merged);
          localStorage.setItem(localProgressKey, JSON.stringify(merged));
        }
      })
      .catch(err => console.log('DB progress fetch fallback:', err.message));
  }, [studentId]);

  // Sync topic selection from query param (e.g. ?topic=tp2 or ?level=Beginner)
  useEffect(() => {
    const topicIdParam = searchParams.get('topic');
    const levelParam = searchParams.get('level');
    
    if (levelParam && ['Beginner', 'Intermediate', 'Advanced'].includes(levelParam)) {
      setLevelFilter(levelParam);
    }
    
    if (topicIdParam) {
      const match = topics.find(t => t.id === topicIdParam);
      if (match) setSelectedTopic(match);
    }
  }, [searchParams, topics]);

  // Filter logic
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'All' || topic.difficulty.toLowerCase() === levelFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && topic.progress === 100) ||
      (statusFilter === 'in_progress' && topic.progress > 0 && topic.progress < 100) ||
      (statusFilter === 'not_started' && topic.progress === 0);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setSearchParams({ topic: topic.id });
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSearchParams({});
  };

  // Open Lesson Modal when clicking a lesson node
  const handleLessonClick = (topic, index) => {
    const isCompleted = index < topic.completedLessons;
    const isLocked = index > topic.completedLessons;
    const lessonData = getLessonData(topic.name, index);

    setActiveLessonModal({
      topicId: topic.id,
      topicName: topic.name,
      lessonIndex: index,
      lessonData,
      isCompleted,
      isLocked
    });
  };

  // Complete lesson action inside modal (Saves to DB & LocalStorage)
  const handleCompleteLesson = (topicId, lessonIndex) => {
    const targetTopic = topics.find(t => t.id === topicId);
    if (!targetTopic) return;

    const newCompletedCount = Math.max(targetTopic.completedLessons, lessonIndex + 1);
    const newProgress = Math.round((newCompletedCount / targetTopic.lessons) * 100);

    // 1. Update React state
    setTopics(prevTopics =>
      prevTopics.map(t => {
        if (t.id === topicId) {
          return {
            ...t,
            completedLessons: newCompletedCount,
            progress: newProgress,
            quizAvailable: newProgress >= 50
          };
        }
        return t;
      })
    );

    if (selectedTopic && selectedTopic.id === topicId) {
      setSelectedTopic(prev => ({
        ...prev,
        completedLessons: newCompletedCount,
        progress: newProgress,
        quizAvailable: newProgress >= 50
      }));
    }

    // 2. Save to LocalStorage
    const localProgressKey = `eco_topic_progress_${studentId}`;
    let currentLocal = {};
    try {
      currentLocal = JSON.parse(localStorage.getItem(localProgressKey) || '{}');
    } catch {}
    currentLocal[topicId] = { completedLessons: newCompletedCount, progress: newProgress };
    localStorage.setItem(localProgressKey, JSON.stringify(currentLocal));

    // 3. Save to Backend Database API (/api/topics/progress)
    fetch('/api/topics/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        topicId,
        completedLessons: newCompletedCount,
        progress: newProgress,
        pointsEarned: 20
      })
    }).catch(err => console.log('DB save error:', err.message));

    setActiveLessonModal(null);
    setShowRewardToast(`🎉 Lesson ${lessonIndex + 1} Completed & Saved to Database (+20 Eco Pts)!`);
    setTimeout(() => setShowRewardToast(null), 3500);
  };


  const levelsList = [
    { label: 'All', count: topics.length },
    { label: 'Beginner', count: topics.filter(t => t.difficulty === 'Beginner').length },
    { label: 'Intermediate', count: topics.filter(t => t.difficulty === 'Intermediate').length },
    { label: 'Advanced', count: topics.filter(t => t.difficulty === 'Advanced').length }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {showRewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold border border-emerald-400"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>{showRewardToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 text-foreground">
            <GraduationCap className="w-7 h-7 text-emerald-500" /> Environmental Learning Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive curriculum designed to build eco-awareness through leveled modules and rewards
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>9 Eco Units • 70+ Leveled Lessons</span>
        </div>
      </motion.div>

      {!selectedTopic ? (
        <>
          {/* Controls: Level Tabs + Search + Status Filters */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* LEVEL TABS BAR */}
            <div className="flex items-center justify-between flex-wrap gap-3 glass p-2 rounded-2xl border border-border/50">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-muted-foreground px-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" /> Level:
                </span>
                {levelsList.map(lvl => {
                  const isActive = levelFilter === lvl.label;
                  return (
                    <button
                      key={lvl.label}
                      onClick={() => setLevelFilter(lvl.label)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105'
                          : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {lvl.label}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {lvl.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'in_progress', 'completed', 'not_started'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      statusFilter === st
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics by keyword (e.g. Climate, Recycling, Water, Biodiversity)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 focus:border-emerald-500 outline-none text-sm transition-colors shadow-xs"
              />
            </div>
          </motion.div>

          {/* TOPICS GRID */}
          <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map(topic => (
              <motion.div
                key={topic.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                onClick={() => handleSelectTopic(topic)}
                className="glass rounded-2xl p-5 cursor-pointer border border-border/60 hover:border-emerald-500/40 transition-all relative overflow-hidden group shadow-sm flex flex-col justify-between"
              >
                {/* Accent glow corner */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity"
                  style={{ background: topic.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-secondary/80 shadow-xs border border-border/40">
                        {topic.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {topic.name}
                        </h3>
                        <span
                          className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                          style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                        >
                          {topic.difficulty} Level
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/40">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Unit Progress</span>
                    <span className="text-foreground">{topic.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.progress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      {topic.completedLessons}/{topic.lessons} Lessons
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      {topic.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        topic.quizAvailable
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      Quiz {topic.quizAvailable ? 'Unlocked ✓' : 'Locked'}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      +{topic.points} pts
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">No topics found matching your filters.</p>
              <button
                onClick={() => { setLevelFilter('All'); setStatusFilter('all'); setSearchQuery(''); }}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </>
      ) : (
        /* TOPIC LEARNING PATH VIEW */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <button
            onClick={handleBackToTopics}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all topics
          </button>

          {/* Unit Header Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl sm:text-6xl p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                  {selectedTopic.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/25 text-white">
                      Unit Syllabus • {selectedTopic.difficulty} Level
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">
                    {selectedTopic.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
                    {selectedTopic.description}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-white/20 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-white/80 font-bold block">Reward Points</span>
                  <span className="text-xl font-black text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 fill-amber-300" /> +{selectedTopic.points} pts
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/student/quiz`)}
                  disabled={!selectedTopic.quizAvailable}
                  className={`mt-2 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                    selectedTopic.quizAvailable
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95'
                      : 'bg-white/20 text-white/60 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {selectedTopic.quizAvailable ? 'Take Topic Quiz' : 'Reach 50% to Unlock Quiz'}
                </button>
              </div>
            </div>
          </div>

          {/* LEARNING PATH CONTAINER */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm">
            <div className="max-w-md mx-auto mb-8 text-center">
              <div className="flex justify-between text-xs font-bold text-foreground mb-2">
                <span>Unit Mastery Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400">{selectedTopic.progress}% Complete</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedTopic.progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full gradient-primary rounded-full"
                />
              </div>
            </div>

            <h3 className="font-extrabold text-center mb-8 text-xs uppercase tracking-widest text-muted-foreground">
              Interactive Learning Path — Click Level Nodes to Study
            </h3>

            {/* SNAKE LEVEL NODES */}
            <div className="relative flex flex-col items-center gap-14 py-8 max-w-md mx-auto">
              {/* Vibrant Gradient Path Line */}
              <div className="absolute top-4 bottom-10 w-2.5 bg-gradient-to-b from-emerald-500 via-sky-500 to-slate-300 dark:to-slate-700 rounded-full z-0 shadow-xs" />

              {Array.from({ length: selectedTopic.lessons }).map((_, i) => {
                const completed = i < selectedTopic.completedLessons;
                const active = i === selectedTopic.completedLessons;
                const locked = i > selectedTopic.completedLessons;

                const lessonData = getLessonData(selectedTopic.name, i);

                // Duolingo style horizontal offset
                const offsets = ['ml-0', 'mr-28', 'ml-28', 'ml-0', 'mr-28', 'ml-28'];
                const marginClass = offsets[i % offsets.length];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`relative z-10 flex flex-col items-center ${marginClass}`}
                  >
                    {/* START Speech Bubble */}
                    {active && (
                      <div className="absolute -top-12 bg-sky-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-md animate-bounce whitespace-nowrap z-20">
                        START LEVEL {i + 1}
                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-sky-500 rotate-45" />
                      </div>
                    )}

                    {/* Interactive Level Node Button */}
                    <button
                      onClick={() => handleLessonClick(selectedTopic, i)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-4 shadow-md transition-all transform active:scale-95 ${
                        completed
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 text-white border-b-6 shadow-emerald-500/20 hover:scale-110'
                          : active
                          ? 'bg-gradient-to-br from-sky-400 to-blue-600 border-sky-300 text-white border-b-6 ring-4 ring-sky-400/30 hover:scale-110'
                          : 'bg-card border-border/80 text-muted-foreground border-b-6 hover:border-slate-400 hover:scale-105'
                      }`}
                    >
                      {completed ? <Check className="w-7 h-7 stroke-[3]" /> : locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : i + 1}
                    </button>

                    {/* Lesson Label */}
                    <div className="mt-2 text-center">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-card border border-border/60 shadow-xs text-foreground max-w-[140px] truncate">
                        {lessonData.title}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* LESSON STUDY MODAL (DESCRIPTIVE & STRUCTURED) */}
      <AnimatePresence>
        {activeLessonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-border/80 shadow-2xl relative space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveLessonModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>{activeLessonModal.topicName} • Lesson {activeLessonModal.lessonIndex + 1}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-foreground leading-snug">
                {activeLessonModal.lessonData.title}
              </h2>

              {activeLessonModal.isLocked ? (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Lock className="w-5 h-5 text-amber-500" /> Lesson Locked
                  </div>
                  <p className="text-sm">Complete Lesson {activeLessonModal.lessonIndex} to unlock this level node and study its environmental concepts!</p>
                </div>
              ) : (
                <>
                  {/* Detailed Overview Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-secondary/50 border border-border/50 text-xs leading-relaxed text-foreground space-y-2">
                    <span className="font-extrabold text-foreground block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" /> Detailed Overview:
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                      {activeLessonModal.lessonData.overview}
                    </p>
                  </div>

                  {/* Key Mechanisms & Bullet Points */}
                  {activeLessonModal.lessonData.keyPoints && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <ListChecks className="w-3.5 h-3.5 text-emerald-500" /> Key Mechanisms & Ecological Impacts:
                      </span>
                      <ul className="space-y-2 text-muted-foreground list-none pl-0">
                        {activeLessonModal.lessonData.keyPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            <span className="text-emerald-500 font-bold mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Takeaway Box */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Key Takeaway:
                    </span>
                    <p className="text-amber-900 dark:text-amber-100 font-semibold leading-relaxed text-xs sm:text-sm">
                      {activeLessonModal.lessonData.takeaway}
                    </p>
                  </div>

                  {/* Real-World Case Study (India) */}
                  {activeLessonModal.lessonData.example && (
                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs space-y-1.5">
                      <span className="font-extrabold text-sky-700 dark:text-sky-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-500" /> 🇮🇳 Real-World Case Study (India):
                      </span>
                      <p className="text-sky-900 dark:text-sky-100 font-medium leading-relaxed text-xs sm:text-sm">
                        {activeLessonModal.lessonData.example}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 flex items-center gap-3">
                    {!activeLessonModal.isCompleted ? (
                      <button
                        onClick={() => handleCompleteLesson(activeLessonModal.topicId, activeLessonModal.lessonIndex)}
                        className="flex-1 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Lesson Complete (+20 Eco Pts)
                      </button>
                    ) : (
                      <div className="flex-1 py-3.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed ✓
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
