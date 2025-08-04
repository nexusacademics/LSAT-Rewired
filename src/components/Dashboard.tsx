// Replace the handleSearch function in your Dashboard component with this:

const handleSearch = async () => {
  if (!searchTerm.trim()) return;
  
  try {
    // First, parse the search query using AI
    const searchParams = await parseSearchQuery(model, searchTerm);
    
    // Build the Supabase query with joins to get test name, section order, and question order
    let query = supabase
      .from('questions')
      .select(`
        id,
        item_id,
        passage,
        question_stem,
        question_order,
        question_type,
        correct_answer_index,
        section_id,
        sections!inner (
          id,
          name,
          section_order,
          section_type,
          test_id,
          tests!inner (
            id,
            name
          )
        ),
        question_options (
          option_letter,
          option_text,
          option_order
        )
      `);

    // Apply filters based on parsed search parameters
    if (searchParams.preptest) {
      // Filter by test name containing the preptest number
      query = query.eq('sections.tests.name', `PrepTest ${searchParams.preptest}`);
    }
    
    if (searchParams.section) {
      // Filter by section order
      query = query.eq('sections.section_order', searchParams.section);
    }
    
    if (searchParams.question) {
      // Filter by question order
      query = query.eq('question_order', searchParams.question);
    }
    
    // If no specific filters, do text search on passage and question stem
    if (!searchParams.preptest && !searchParams.section && !searchParams.question) {
      query = query.or(
        `passage.ilike.%${searchTerm}%,question_stem.ilike.%${searchTerm}%`
      );
    }
    
    // If keywords are provided, add them to the search
    if (searchParams.keywords && searchParams.keywords.length > 0) {
      const keywordConditions = searchParams.keywords
        .map(keyword => `passage.ilike.%${keyword}%,question_stem.ilike.%${keyword}%`)
        .join(',');
      query = query.or(keywordConditions);
    }

    // Execute the query
    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error('Search error:', error);
      return;
    }

    // Transform the data to match the ProcessedQuestion interface
    const transformedResults = data?.map(item => {
      // Extract options from the nested question_options array
      const options = item.question_options
        ?.sort((a, b) => a.option_order - b.option_order)
        ?.map(opt => opt.option_text) || [];

      return {
        id: item.id,
        passage: item.passage,
        question: item.question_stem, // Map question_stem to question
        options: options,
        correctAnswer: item.correct_answer_index,
        type: item.question_type,
        // Include the joined data for proper display
        tests: item.sections?.tests,
        sections: item.sections,
        question_order: item.question_order,
        section_id: item.section_id,
        // For backward compatibility, also include direct fields
        test_name: item.sections?.tests?.name,
        section_order: item.sections?.section_order,
        section_type: item.sections?.section_type,
        question_type: item.question_type
      };
    }) || [];

    setSearchResults(transformedResults);
    setSearchModalOpen(true);
    
  } catch (error) {
    console.error('Search failed:', error);
    // Optionally show an error message to the user
  }
};